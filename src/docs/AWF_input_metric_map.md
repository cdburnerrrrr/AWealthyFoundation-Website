# A Wealthy Foundation Input → Metric Map

Use this as a product/reference document, not app code. It helps prevent duplicated questions and makes it clear which inputs power each score, report insight, or dashboard metric.

## Foundation / Household

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Age range | `ageRange` | life stage, comparison group, report framing | Context only. |
| Household type | `relationshipStatus` | dependent logic, protection logic, childcare logic | If dependents are selected, show childcare inline here. |
| Monthly childcare/daycare cost | `monthlyChildcareCost` | fixed cost load, monthly margin, emergency fund months, income pressure | Capture once only inside household card. Do not ask childcare pressure separately. |

## Income

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Monthly take-home income | `monthlyTakeHomeIncome` | fixed cost load, savings rate, investing rate, debt ratios, income pressure | Core denominator for most ratios. |
| Income consistency | `incomeConsistency` | income score, risk signals, protection recommendations | Useful for variable-income households. |
| Income growth potential | `incomeGrowthPotential` | best next move, income recommendations | Helps determine whether income growth is realistic. |

## Housing / Fixed Costs

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Housing situation | `housingStatus` | housing flow, primary residence logic, fixed cost load | Captures primary residence once. |
| Rent / primary housing payment | `monthlyHousingCost` | fixed cost load, monthly margin, housing pressure | Primary fixed cost. |
| Primary home value | `primaryHomeValue` | net worth, home equity, asset allocation | Only for owners. |
| Primary mortgage balance | `primaryMortgage` / `primaryMortgageBalance` | net worth, home equity, liabilities | Mortgage debt should not be treated like consumer debt. |
| Utilities | `monthlyUtilities` | fixed cost load, monthly margin, emergency fund months | Must-pay cost. |
| Additional property ownership | `additionalPropertyOwnership` | property relief logic, net worth, asset allocation | Does not include primary residence. |
| Rental property value | `rentalPropertyValue` | net worth, non-primary property equity, asset allocation | Can power move-in/sell/refinance recommendations. |
| Rental mortgage balance | `rentalMortgage` / `rentalMortgageBalance` | net worth, liabilities | Non-primary property debt. |
| Other property value | `otherPropertyValue` | net worth, non-primary property equity | Land/second home/other real estate. |
| Other property debt | `otherPropertyDebt` | net worth, liabilities | Non-primary property debt. |

## Saving

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Saving consistency | `savingConsistency` | saving score, savings behavior | Parent card for savings details. |
| Monthly savings amount | `monthlySavingsContribution` | savings rate, savings score, dashboard/report comparison | User may enter dollars OR percent. |
| Monthly savings percent | `monthlySavingsPercent` | savings rate, savings score | Converted to dollars using take-home income if dollar amount is blank. |
| Current cash savings balance | `totalLiquidSavings` / `cashSavings` | emergency fund months, net worth, cash cushion, asset allocation | Cash balance is not the same as savings rate. |
| Saving setup | `savingsAutomation` | saving behavior, recommendations | Behavior signal only. |
| Emergency accessibility | `emergencyAccess` | protection/saving nuance | Ask only after cash balance exists and only if savings > 0. |

## Debt / Vehicle

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Vehicle situation | `vehicleDebt` | debt flow, vehicle decision module | Parent card. |
| Vehicle loan balance | `carLoanBalance` | consumer debt, vehicle equity, net worth/liability context | Powers underwater vehicle logic. |
| Monthly vehicle payment | `monthlyVehiclePayment` | fixed cost load, monthly margin, vehicle payment ratio | Must-pay cost. |
| Vehicle value | `vehicleValue` | vehicle equity, underwater amount | Powers sell/trade/refinance recommendations. |
| Debt types | `otherDebt` | debt flow, debt score | Parent card. |
| Credit card balance/payment | `creditCardDebt`, `creditCardPayment` | consumer debt, debt pressure, monthly debt payments | High priority debt signal. |
| Student loan balance/payment | `studentLoans`, `studentLoanPayment` | consumer debt, monthly debt payments | Lower priority than credit/payday unless payment pressure is high. |
| Personal loan balance/payment | `personalLoans`, `personalLoanPayment` | consumer debt, monthly debt payments | Debt pressure. |
| BNPL balance/payment | `bnplDebt`, `bnplPayment` | consumer debt, debt cycle signal | Strong behavioral pressure signal. |
| Payday balance/payment | `paydayDebt`, `paydayPayment` | consumer debt, critical debt signal | Highest risk debt signal. |
| Medical balance/payment | `medicalDebt`, `medicalDebtPayment` | consumer debt, monthly debt payments | Debt pressure. |
| Debt manageability | `debtManageability` | debt score and tone | Subjective stress signal. |
| Debt paydown strategy | `debtPaydownStrategy` | debt plan signal | Behavior signal. |

## Protection

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Income protection perception | `incomeProtectionLevel` | protection score, income protection reality check | Snapshot perception. Full assessment can compare perception to calculated reality. |
| Income protection reality check | `incomeProtectionRealityCheck`, `incomeProtectionShift` | report insight | Calculated using cash savings, must-pay costs, disability coverage, income sources. |
| Insurance checklist | `protectionCoverage` | protection coverage count and follow-up flow | Parent card. |
| Health coverage quality | `healthCoverage` | protection score | Detail only if health is selected. |
| Auto coverage level | `autoCoverage` | protection score | Detail only if auto is selected. |
| Homeowners/renters coverage | `propertyCoverage` | protection score | Detail only if selected. |
| Life insurance adequacy | `lifeInsurance` | protection score, dependents risk | More important when dependents exist. |
| Disability coverage | `disabilityCoverage` | income protection score | Strongly tied to single-income risk. |
| Umbrella coverage amount | `umbrellaCoverageAmount` | protection score, lawsuit/liability protection | Ask amount only if umbrella is selected. |

## Investing

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Investing status | `investingStatus` | investing score, recommendations | Behavior signal. |
| Investment accounts | `investmentAccounts` | investment detail flow, asset allocation | Parent card. |
| 401(k) balance/contribution/%/match | `k401Balance`, `k401Contribution`, `k401ContributionPercent`, `k401Match` | total investments, investing rate, match recommendation | Dollar contribution overrides percent if both are entered. |
| Traditional IRA balance/contribution/% | `iraBalance`, `iraContribution`, `iraContributionPercent` | total investments, investing rate | Converted using take-home income when percent is used. |
| Roth IRA balance/contribution/% | `rothBalance`, `rothContribution`, `rothContributionPercent` | total investments, investing rate | Asset allocation. |
| Brokerage/stocks balance/contribution/% | `brokerageBalance`, `brokerageContribution`, `brokerageContributionPercent` | total investments, investing rate | Covers taxable brokerage and individual stocks. |
| HSA invested balance/contribution/% | `hsaBalance`, `hsaContribution`, `hsaContributionPercent` | total investments, investing rate | Count only invested HSA assets here. |
| Other investment assets/contribution/% | `otherInvestmentAssets`, `otherInvestmentContribution`, `otherInvestmentContributionPercent` | total investments, investing rate | Catch-all investment category. |
| Investment confidence | `investmentConfidence` | investing score and report tone | Behavior/confidence signal. |
| Investment mix | `investmentMix` | investing score and report recommendations | Diversification signal. |

## Vision

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Financial direction | `financialDirection` | vision score, report tone | Directional clarity. |
| Primary financial priority | `primaryFinancialPriority` | next move, report focus | User-stated priority. |
| Financial confidence | `financialConfidence` | report tone, next move language | Confidence signal. |

## Net Worth Builder

| Input | Answer key | Powers | Notes |
|---|---|---|---|
| Savings final value | `totalLiquidSavings` / `cashSavings` | final net worth, asset allocation, emergency fund months | Net Worth Builder final values override earlier estimates. |
| Investments final value | `totalInvestments` | final net worth, asset allocation | Should prefill from itemized investment accounts. |
| Primary home final value | `primaryHomeValue` / `homeValue` | final net worth, home equity | Avoid double counting primary equity. |
| Primary mortgage final balance | `primaryMortgageBalance` / `mortgageBalance` | final net worth, liabilities | Avoid double counting. |
| Rental/other property final values/debts | rental/other property keys | final net worth, asset allocation, structural opportunity logic | Can power move-in/sell/refinance recommendation. |
| Consumer debt final total | `totalDebtBalance` / `consumerDebtBalance` | final net worth, debt pressure | Itemized debt is the fallback if builder not completed. |
| Other assets | `otherAssets` | final net worth | Catch-all. |

## Derived Metrics

| Metric | Formula / Source | Uses |
|---|---|---|
| Fixed cost load | `(housing + utilities + childcare + vehicle payments + debt payments) / take-home income` | Dashboard, report, pressure signals, income pressure. |
| Monthly margin | `take-home income - fixed costs` | Dashboard, Today’s Move, report. |
| Emergency fund months | `cash savings / fixed costs` | Protection, Saving, Income Protection Reality Check. |
| Savings rate | `monthly savings dollars OR savings percent converted to dollars / take-home income` | Comparison section, dashboard/report. Missing data should show “Not captured,” not 0%. |
| Investing rate | `sum of investment contributions dollars OR percents converted to dollars / take-home income` | Comparison section, investing score, dashboard/report. Missing data should show “Not captured,” not 0%. |
| Net worth | `total assets - total liabilities`, preferably from Net Worth Builder final values | Report and dashboard source of truth. |
| Home equity | `primary home value - primary mortgage + non-primary property equity` | Net worth, asset allocation, property recommendations. |
| Vehicle underwater amount | `car loan balance - vehicle value` if positive | Vehicle reality check and debt recommendations. |
| Income pressure | fixed cost load + income consistency + monthly margin + dependents/childcare context | Recommendation engine and executive summary. |

## Childcare Rule

Childcare/daycare should be captured once only:

1. Ask household type.
2. If dependents are selected, collect `monthlyChildcareCost` inline.
3. Do not ask a separate subjective childcare pressure question.
4. Derive childcare pressure from the actual dollar amount, income, fixed cost load, and monthly margin.
