export function shouldShowQuestion(question: any, answers: Record<string, any>) {
    if (!question.conditions) return true;
  
    return question.conditions.every((condition: any) => {
      const value = answers[condition.key];
  
      if (condition.operator === "equals") {
        return value === condition.value;
      }
  
      if (condition.operator === "in") {
        return condition.value.includes(value);
      }
  
      return true;
    });
  }