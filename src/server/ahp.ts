import { Inventori, AHPResult, AHPPriorityItem } from '../types';

// Random Index (RI) table for AHP
const RI_TABLE: Record<number, number> = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49
};

// Default comparison matrix for 4 criteria: [Stok Saat Ini, Safety Stock, Profit, Jumlah Terjual]
// Safety Stock is given high priority, then Jumlah Terjual, then Profit, and Stok is lowest (since actual deficit is evaluated in safety stock)
export const DEFAULT_CRITERIA_MATRIX = [
  [1.0,       0.3333,    0.5,       0.5],       // Stok Saat Ini (C1)
  [3.0,       1.0,       2.0,       1.5],       // Safety Stock (C2)
  [2.0,       0.5,       1.0,       0.8],       // Profit (C3)
  [2.0,       0.6667,    1.25,      1.0]        // Jumlah Terjual (C4)
];

export function calculateAHP(
  items: Inventori[],
  criteriaMatrix: number[][] = DEFAULT_CRITERIA_MATRIX
): AHPResult {
  const n = criteriaMatrix.length; // n = 4
  
  // 1. Calculate column sums
  const colSums = Array(n).fill(0);
  for (let c = 0; c < n; c++) {
    for (let r = 0; r < n; r++) {
      colSums[c] += criteriaMatrix[r][c];
    }
  }

  // 2. Normalize the matrix and calculate row averages (Eigen Vector / Weights)
  const normMatrix = Array.from({ length: n }, () => Array(n).fill(0));
  const eigenVector = Array(n).fill(0);
  for (let r = 0; r < n; r++) {
    let rowSum = 0;
    for (let c = 0; c < n; c++) {
      normMatrix[r][c] = criteriaMatrix[r][c] / colSums[c];
      rowSum += normMatrix[r][c];
    }
    eigenVector[r] = rowSum / n;
  }

  // 3. Consistency Calculations
  // Find weighted sum vector: Matrix * EigenVector
  const weightedSum = Array(n).fill(0);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      weightedSum[r] += criteriaMatrix[r][c] * eigenVector[c];
    }
  }

  // Find consistency vector (weighted sum element / eigen vector element)
  const consistencyVector = Array(n).fill(0);
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    consistencyVector[i] = weightedSum[i] / eigenVector[i];
    lambdaMax += consistencyVector[i];
  }
  lambdaMax /= n; // lambda max is average of consistency vector

  // Consistency Index (CI)
  const ci = (lambdaMax - n) / (n - 1);
  
  // Consistency Ratio (CR)
  const ri = RI_TABLE[n] || 0.90;
  const cr = ri > 0 ? ci / ri : 0;
  const isConsistent = cr <= 0.1;

  // 4. Rank Alternatives (Inventory Items)
  // Extract values
  const alternativesData = items.map(item => {
    const profit = Math.max(0, item.harga_eceran - item.harga_grosir);
    // Deficit of stock relative to safety stock
    const deficit = Math.max(0, item.safety_stock - item.stok_saat_ini);
    
    return {
      item,
      stok: item.stok_saat_ini,
      safety: item.safety_stock,
      deficit,
      profit,
      terjual: item.jumlah_terjual
    };
  });

  // Find extremes to normalize scores to [0, 1] range
  const minStok = Math.min(...alternativesData.map(d => d.stok), 0);
  const maxStok = Math.max(...alternativesData.map(d => d.stok), 1);
  const maxDeficit = Math.max(...alternativesData.map(d => d.deficit), 1);
  const maxProfit = Math.max(...alternativesData.map(d => d.profit), 1);
  const maxTerjual = Math.max(...alternativesData.map(d => d.terjual), 1);

  // Normalize each alternative's performance and calculate priority score
  const rankedItems: AHPPriorityItem[] = alternativesData.map(data => {
    // C1: Stok Saat Ini (Lower stock is HIGHER priority, so normalize as (Max - Stok) / (Max - Min))
    const s_stok = maxStok === minStok ? 1.0 : (maxStok - data.stok) / (maxStok - minStok);
    
    // C2: Safety Stock Deficit (Higher deficit is HIGHER priority, so normalize to max deficit)
    const s_safety = maxDeficit === 0 ? 0.0 : data.deficit / maxDeficit;

    // C3: Profit (Higher profit is HIGHER priority, normalize to max profit)
    const s_profit = maxProfit === 0 ? 0.0 : data.profit / maxProfit;

    // C4: Jumlah Terjual (Higher sales is HIGHER priority, normalize to max sold)
    const s_terjual = maxTerjual === 0 ? 0.0 : data.terjual / maxTerjual;

    // Composite Score = sum(criteria_score * criteria_weight)
    const score = (
      s_stok * eigenVector[0] +
      s_safety * eigenVector[1] +
      s_profit * eigenVector[2] +
      s_terjual * eigenVector[3]
    );

    // Formulate a dynamic recommendation message
    let rekomendasi = 'Stok Aman';
    if (data.stok <= data.safety * 0.2) {
      rekomendasi = 'SANGAT SEGERA: Stok kritis di bawah 20% safety stock!';
    } else if (data.stok <= data.safety) {
      rekomendasi = 'Beli Baru: Stok di bawah batas safety stock!';
    } else if (data.deficit === 0 && score > 0.5) {
      rekomendasi = 'Optimasi: Stok aman, tawarkan promo untuk mempercepat penjualan.';
    } else {
      rekomendasi = 'Prioritas Rendah: Stok memadai.';
    }

    return {
      id_barang: data.item.id_barang,
      nama_barang: data.item.nama_barang,
      stok_saat_ini: data.stok,
      safety_stock: data.safety,
      profit: data.profit,
      jumlah_terjual: data.terjual,
      score: parseFloat(score.toFixed(4)),
      rank: 0, // Assigned after sorting
      rekomendasi
    };
  });

  // Sort by score in descending order
  rankedItems.sort((a, b) => b.score - a.score);
  
  // Assign ranks
  rankedItems.forEach((item, index) => {
    item.rank = index + 1;
  });

  return {
    matrix: criteriaMatrix,
    eigenVector: eigenVector.map(w => parseFloat(w.toFixed(4))),
    ci: parseFloat(ci.toFixed(4)),
    cr: parseFloat(cr.toFixed(4)),
    isConsistent,
    alternatives: rankedItems
  };
}
