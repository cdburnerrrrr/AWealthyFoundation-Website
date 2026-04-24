export type EmergencyInputs = {
    monthlyExpenses: number;
    currentSavings: number;
    incomeStability: 'stable' | 'variable' | 'uncertain';
    dependents: 'none' | 'some' | 'many';
    housing: 'rent' | 'own' | 'own_high_maintenance';
  };
  
  export type EmergencyResult = {
    minMonths: number;
    maxMonths: number;
    minTarget: number;
    maxTarget: number;
    gapMin: number;
    gapMax: number;
    recommendationLabel: string;
  };
  
  export function calculateEmergencyFund(input: EmergencyInputs): EmergencyResult {
    let baseMin = 3;
    let baseMax = 4;
  
    // Income stability
    if (input.incomeStability === 'variable') {
      baseMin += 1;
      baseMax += 1;
    }
    if (input.incomeStability === 'uncertain') {
      baseMin += 2;
      baseMax += 2;
    }
  
    // Dependents
    if (input.dependents === 'some') {
      baseMax += 1;
    }
    if (input.dependents === 'many') {
      baseMin += 1;
      baseMax += 2;
    }
  
    // Housing risk
    if (input.housing === 'own_high_maintenance') {
      baseMax += 1;
    }
  
    const minTarget = input.monthlyExpenses * baseMin;
    const maxTarget = input.monthlyExpenses * baseMax;
  
    return {
      minMonths: baseMin,
      maxMonths: baseMax,
      minTarget,
      maxTarget,
      gapMin: Math.max(0, minTarget - input.currentSavings),
      gapMax: Math.max(0, maxTarget - input.currentSavings),
      recommendationLabel:
        baseMax <= 4
          ? 'Stable foundation'
          : baseMax <= 6
          ? 'Moderate buffer recommended'
          : 'Stronger safety net recommended',
    };
  }