/**
 * A Wealthy Foundation - Backend API
 * Financial assessment and scoring system
 */

import { Hono } from "hono";
import type { Client } from "@sdk/server-types";
import { tables, buckets } from "@generated";
import { eq, desc, and } from "drizzle-orm";

// Financial Pillars Configuration
const PILLAR_WEIGHTS: Record<string, number> = {
  income: 1.0,
  cashFlow: 1.2,
  debt: 1.1,
  protection: 1.0,
  investments: 1.3,
  organization: 0.8,
  direction: 1.5, // Higher weight - the differentiator
};

const PILLAR_NAMES: Record<string, string> = {
  income: "Income",
  cashFlow: "Cash Flow",
  debt: "Debt",
  protection: "Protection",
  investments: "Investments",
  organization: "Financial Organization",
  direction: "Direction",
};

// Reporting Categories
const REPORTING_CATEGORIES = {
  stability: ["income", "protection"],
  control: ["cashFlow"],
  leverage: ["debt"],
  growth: ["investments"],
  organization: ["organization"],
  direction: ["direction"],
};

// Scoring algorithm: Convert 1-100 pillar scores to 1-850 wealth score
function calculateWealthScore(pillarScores: Record<string, number>): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [pillar, score] of Object.entries(pillarScores)) {
    const weight = PILLAR_WEIGHTS[pillar] || 1.0;
    totalWeightedScore += score * weight;
    totalWeight += weight;
  }

  const averageScore = totalWeightedScore / totalWeight;
  
  // Scale from 1-100 to 300-850 (credit score style)
  // Formula: 300 + (averageScore / 100) * 550
  const wealthScore = Math.round(300 + (averageScore / 100) * 550);
  
  return Math.min(850, Math.max(300, wealthScore));
}

// Calculate pillar scores from questionnaire responses
function calculatePillarScores(responses: Record<string, any>): Record<string, number> {
  const scores: Record<string, number> = {};

  // Income Pillar (Stability, Growth, Concentration, Career)
  scores.income = calculateIncomeScore(responses);

  // Cash Flow Pillar (Spending, Savings Rate, Lifestyle Creep, Margin)
  scores.cashFlow = calculateCashFlowScore(responses);

  // Debt Pillar (High-Interest, DTI, Strategic vs Destructive, Paydown)
  scores.debt = calculateDebtScore(responses);

  // Protection Pillar (Emergency Fund, Insurance, Risk Mitigation)
  scores.protection = calculateProtectionScore(responses);

  // Investments Pillar (Participation, Consistency, Long-term, Tax-advantaged)
  scores.investments = calculateInvestmentsScore(responses);

  // Organization Pillar (Account Tracking, Beneficiaries, Documents, Net Worth)
  scores.organization = calculateOrganizationScore(responses);

  // Direction Pillar (Goals, Values Alignment, Written Plan, Reviews)
  scores.direction = calculateDirectionScore(responses);

  return scores;
}

function calculateIncomeScore(r: Record<string, any>): number {
  let score = 50;
  
  // Income stability
  if (r.incomeStability === "very_stable") score += 15;
  else if (r.incomeStability === "stable") score += 10;
  else if (r.incomeStability === "somewhat_stable") score += 5;
  else score -= 5;

  // Growth trajectory
  if (r.incomeGrowth === "strong_growth") score += 15;
  else if (r.incomeGrowth === "moderate_growth") score += 10;
  else if (r.incomeGrowth === "stable") score += 5;
  else score -= 5;

  // Income concentration
  if (r.incomeSources === "multiple_diverse") score += 10;
  else if (r.incomeSources === "multiple_similar") score += 5;
  else score -= 10;

  // Career momentum
  if (r.careerMomentum === "advancing") score += 10;
  else if (r.careerMomentum === "stable") score += 5;

  return Math.max(1, Math.min(100, score));
}

function calculateCashFlowScore(r: Record<string, any>): number {
  let score = 50;

  // Savings rate
  const savingsRate = parseInt(r.savingsRate) || 0;
  if (savingsRate >= 30) score += 20;
  else if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 10) score += 10;
  else if (savingsRate >= 5) score += 5;
  else score -= 10;

  // Spending discipline
  if (r.spendingDiscipline === "very_disciplined") score += 15;
  else if (r.spendingDiscipline === "disciplined") score += 10;
  else if (r.spendingDiscipline === "somewhat") score += 5;
  else score -= 5;

  // Lifestyle creep
  if (r.lifestyleCreep === "none") score += 10;
  else if (r.lifestyleCreep === "minimal") score += 5;
  else if (r.lifestyleCreep === "moderate") score -= 5;
  else score -= 10;

  // Budget tracking
  if (r.budgetTracking === "detailed") score += 10;
  else if (r.budgetTracking === "general") score += 5;

  return Math.max(1, Math.min(100, score));
}

function calculateDebtScore(r: Record<string, any>): number {
  let score = 50;

  // Mortgage debt (strategic debt - treated more favorably)
  if (r.mortgageDebt === "none") score += 10;
  else if (r.mortgageDebt === "manageable") score += 15;
  else if (r.mortgageDebt === "tight") score += 0;
  else score -= 10;

  // Consumer debt (credit cards, student loans, car loans, BNPL)
  if (r.consumerDebt === "none") score += 20;
  else if (r.consumerDebt === "low") score += 10;
  else if (r.consumerDebt === "moderate") score -= 5;
  else score -= 15;

  // High-interest debt (credit cards 20%+ APR, payday loans)
  if (r.highInterestDebt === "none") score += 20;
  else if (r.highInterestDebt === "low") score += 10;
  else if (r.highInterestDebt === "moderate") score -= 10;
  else score -= 20;

  // Debt-to-income ratio
  const dti = parseInt(r.debtToIncome) || 0;
  if (dti <= 10) score += 15;
  else if (dti <= 20) score += 10;
  else if (dti <= 35) score += 5;
  else if (dti <= 50) score -= 10;
  else score -= 20;

  // Debt paydown progress
  if (r.debtPaydown === "ahead") score += 10;
  else if (r.debtPaydown === "on_track") score += 5;
  else if (r.debtPaydown === "behind") score -= 10;

  // Strategic vs destructive debt
  if (r.debtStrategy === "strategic_only") score += 10;
  else if (r.debtStrategy === "mostly_strategic") score += 5;
  else score -= 5;

  return Math.max(1, Math.min(100, score));
}

function calculateProtectionScore(r: Record<string, any>): number {
  let score = 50;

  // Emergency fund (months of expenses)
  const emergencyMonths = parseInt(r.emergencyFund) || 0;
  if (emergencyMonths >= 6) score += 20;
  else if (emergencyMonths >= 3) score += 15;
  else if (emergencyMonths >= 1) score += 5;
  else score -= 10;

  // Insurance coverage
  if (r.insuranceCoverage === "comprehensive") score += 15;
  else if (r.insuranceCoverage === "adequate") score += 10;
  else if (r.insuranceCoverage === "basic") score += 5;
  else score -= 10;

  // Income protection
  if (r.incomeProtection === "yes") score += 15;
  else if (r.incomeProtection === "partial") score += 5;
  else score -= 5;

  return Math.max(1, Math.min(100, score));
}

function calculateInvestmentsScore(r: Record<string, any>): number {
  let score = 30; // Start lower - investing is crucial

  // Participation
  if (r.investing === "yes_active") score += 25;
  else if (r.investing === "yes_passive") score += 20;
  else if (r.investing === "starting") score += 10;
  else return Math.max(1, Math.min(100, score));

  // Consistency
  if (r.investmentConsistency === "automated") score += 15;
  else if (r.investmentConsistency === "regular") score += 10;
  else if (r.investmentConsistency === "irregular") score += 5;
  else score -= 5;

  // Tax-advantaged accounts
  if (r.taxAdvantaged === "maxed") score += 15;
  else if (r.taxAdvantaged === "contributing") score += 10;
  else if (r.taxAdvantaged === "aware") score += 5;

  // Diversification awareness
  if (r.diversification === "yes_rebalanced") score += 10;
  else if (r.diversification === "yes_aware") score += 5;

  return Math.max(1, Math.min(100, score));
}

function calculateOrganizationScore(r: Record<string, any>): number {
  let score = 50;

  // Account tracking
  if (r.accountTracking === "centralized") score += 15;
  else if (r.accountTracking === "organized") score += 10;
  else if (r.accountTracking === "aware") score += 5;
  else score -= 5;

  // Beneficiary updates
  if (r.beneficiaryUpdates === "current") score += 10;
  else if (r.beneficiaryUpdates === "mostly_current") score += 5;
  else score -= 5;

  // Document clarity
  if (r.documentClarity === "organized") score += 10;
  else if (r.documentClarity === "somewhat") score += 5;
  else score -= 5;

  // Net worth awareness
  if (r.netWorthAwareness === "tracks_monthly") score += 10;
  else if (r.netWorthAwareness === "knows_approximately") score += 5;
  else score -= 5;

  // Estate basics
  if (r.estateBasics === "complete") score += 10;
  else if (r.estateBasics === "in_progress") score += 5;

  return Math.max(1, Math.min(100, score));
}

function calculateDirectionScore(r: Record<string, any>): number {
  let score = 40; // Start lower - this is crucial

  // Defined financial goals
  if (r.financialGoals === "detailed") score += 20;
  else if (r.financialGoals === "general") score += 10;
  else if (r.financialGoals === "vague") score += 5;
  else score -= 5;

  // Values alignment
  if (r.valuesAlignment === "strong") score += 15;
  else if (r.valuesAlignment === "moderate") score += 10;
  else if (r.valuesAlignment === "some") score += 5;
  else score -= 5;

  // Written plan
  if (r.writtenPlan === "yes_detailed") score += 15;
  else if (r.writtenPlan === "yes_basic") score += 10;
  else if (r.writtenPlan === "mental_only") score += 5;
  else score -= 5;

  // Quarterly reviews
  if (r.quarterlyReviews === "yes_regular") score += 15;
  else if (r.quarterlyReviews === "sometimes") score += 5;
  else score -= 5;

  return Math.max(1, Math.min(100, score));
}

// Generate recommendations based on scores
function generateRecommendations(pillarScores: Record<string, number>): string[] {
  const recommendations: string[] = [];
  
  if (pillarScores.income < 60) {
    recommendations.push("Focus on diversifying your income sources to reduce concentration risk");
    recommendations.push("Invest in skills development to strengthen your career momentum");
  }
  
  if (pillarScores.cashFlow < 60) {
    recommendations.push("Create a detailed budget to improve spending discipline");
    recommendations.push("Automate your savings to reach at least 20% savings rate");
  }
  
  if (pillarScores.debt < 60) {
    recommendations.push("Prioritize paying off high-interest debt using the avalanche method");
    recommendations.push("Avoid taking on new debt while paying down existing obligations");
  }
  
  if (pillarScores.protection < 60) {
    recommendations.push("Build your emergency fund to cover at least 3-6 months of expenses");
    recommendations.push("Review your insurance coverage for gaps in protection");
  }
  
  if (pillarScores.investments < 60) {
    recommendations.push("Start investing if you haven't already - time in the market matters");
    recommendations.push("Maximize tax-advantaged accounts like 401(k) and IRA");
  }
  
  if (pillarScores.organization < 60) {
    recommendations.push("Create a central document with all your account information");
    recommendations.push("Update beneficiaries on all accounts and insurance policies");
  }
  
  if (pillarScores.direction < 60) {
    recommendations.push("Write down your financial goals with specific timelines");
    recommendations.push("Schedule quarterly reviews to track progress and adjust your plan");
  }
  
  return recommendations.slice(0, 5); // Return top 5 recommendations
}

export async function createApp(
  edgespark: Client<typeof tables>
): Promise<Hono> {
  const app = new Hono();

  // ============================================
  // Public Routes
  // ============================================
  
  app.get("/api/public/hello", (c) => 
    c.json({ message: "Welcome to A Wealthy Foundation API" })
  );

  // ============================================
  // User Profile Routes
  // ============================================

  app.get("/api/profile", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await edgespark.db
      .select()
      .from(tables.userProfiles)
      .where(eq(tables.userProfiles.userId, user.id));

    if (profile.length === 0) {
      // Create profile if doesn't exist
      const [newProfile] = await edgespark.db
        .insert(tables.userProfiles)
        .values({
          userId: user.id,
          name: user.name,
          email: user.email,
        })
        .returning();
      return c.json({ profile: newProfile });
    }

    return c.json({ profile: profile[0] });
  });

  app.patch("/api/profile", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const [updated] = await edgespark.db
      .update(tables.userProfiles)
      .set({
        ...body,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(tables.userProfiles.userId, user.id))
      .returning();

    return c.json({ profile: updated });
  });

  // ============================================
  // Assessment Routes
  // ============================================

  // Create new assessment
  app.post("/api/assessments", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const body = await c.req.json();
      const { assessmentType, responses } = body;

      console.log("[API] POST /api/assessments - creating assessment:", { 
        userId: user.id, 
        assessmentType 
      });

      // Calculate pillar scores
      const pillarScores = calculatePillarScores(responses);
      
      // Calculate overall wealth score
      const wealthScore = calculateWealthScore(pillarScores);

      // Calculate overall score (average of pillar scores)
      const overallScore = Math.round(
        Object.values(pillarScores).reduce((a, b) => a + b, 0) / 
        Object.values(pillarScores).length
      );

      // Create assessment record
      const [assessment] = await edgespark.db
        .insert(tables.assessments)
        .values({
          userId: user.id,
          assessmentType,
          overallScore,
          wealthScore,
        })
        .returning();

      console.log("[API] POST /api/assessments - created assessment:", assessment.id);

      // Store individual pillar scores
      for (const [pillarKey, rawScore] of Object.entries(pillarScores)) {
        const weight = PILLAR_WEIGHTS[pillarKey] || 1.0;
        await edgespark.db.insert(tables.pillarScores).values({
          assessmentId: assessment.id,
          pillarName: PILLAR_NAMES[pillarKey],
          pillarKey,
          rawScore,
          weight,
          weightedScore: Math.round(rawScore * weight),
        });
      }

      // Generate recommendations
      const recommendations = generateRecommendations(pillarScores);

      console.log("[API] POST /api/assessments - success, returning assessment");

      return c.json({
        assessment: {
          ...assessment,
          pillarScores,
          recommendations,
          reportingCategories: REPORTING_CATEGORIES,
        },
      });
    } catch (error) {
      console.error("[API] POST /api/assessments - error:", error);
      return c.json({ error: "Failed to create assessment" }, 500);
    }
  });

  // Get all assessments for user
  app.get("/api/assessments", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const assessments = await edgespark.db
      .select()
      .from(tables.assessments)
      .where(eq(tables.assessments.userId, user.id))
      .orderBy(desc(tables.assessments.createdAt));

    return c.json({ assessments });
  });

  // Get single assessment with pillar scores
  app.get("/api/assessments/:id", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = parseInt(c.req.param("id"));

    const [assessment] = await edgespark.db
      .select()
      .from(tables.assessments)
      .where(
        and(
          eq(tables.assessments.id, id),
          eq(tables.assessments.userId, user.id)
        )
      );

    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    const pillarScoresList = await edgespark.db
      .select()
      .from(tables.pillarScores)
      .where(eq(tables.pillarScores.assessmentId, id));

    const pillarScores: Record<string, number> = {};
    for (const ps of pillarScoresList) {
      pillarScores[ps.pillarKey] = ps.rawScore || 0;
    }

    const recommendations = generateRecommendations(pillarScores);

    return c.json({
      assessment: {
        ...assessment,
        pillarScores,
        recommendations,
        reportingCategories: REPORTING_CATEGORIES,
      },
    });
  });

  // Get latest assessment
  app.get("/api/assessments/latest", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const [assessment] = await edgespark.db
        .select()
        .from(tables.assessments)
        .where(eq(tables.assessments.userId, user.id))
        .orderBy(desc(tables.assessments.createdAt))
        .limit(1);

      if (!assessment) {
        console.log("[API] No assessment found for user:", user.id);
        return c.json({ assessment: null });
      }

      console.log("[API] Found assessment:", assessment.id, "for user:", user.id);

      const pillarScoresList = await edgespark.db
        .select()
        .from(tables.pillarScores)
        .where(eq(tables.pillarScores.assessmentId, assessment.id));

      const pillarScores: Record<string, number> = {};
      for (const ps of pillarScoresList) {
        pillarScores[ps.pillarKey] = ps.rawScore || 0;
      }

      const recommendations = generateRecommendations(pillarScores);

      return c.json({
        assessment: {
          ...assessment,
          pillarScores,
          recommendations,
          reportingCategories: REPORTING_CATEGORIES,
        },
      });
    } catch (error) {
      console.error("[API] Error in /api/assessments/latest:", error);
      return c.json({ assessment: null });
    }
  });

  // ============================================
  // Consultation Routes
  // ============================================

  // Schedule consultation
  app.post("/api/consultations", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { scheduledAt, notes } = body;

    console.log("[API] POST /api/consultations - scheduling:", { 
      userId: user.id, 
      scheduledAt 
    });

    const [consultation] = await edgespark.db
      .insert(tables.consultations)
      .values({
        userId: user.id,
        scheduledAt,
        notes,
        advisorName: "Financial Advisor",
        status: "scheduled",
      })
      .returning();

    console.log("[API] POST /api/consultations - created:", consultation.id);

    return c.json({ consultation });
  });

  // Get user consultations
  app.get("/api/consultations", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const consultations = await edgespark.db
      .select()
      .from(tables.consultations)
      .where(eq(tables.consultations.userId, user.id))
      .orderBy(desc(tables.consultations.scheduledAt));

    return c.json({ consultations });
  });

  // Cancel consultation
  app.patch("/api/consultations/:id/cancel", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = parseInt(c.req.param("id"));

    const [updated] = await edgespark.db
      .update(tables.consultations)
      .set({
        status: "cancelled",
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(
        and(
          eq(tables.consultations.id, id),
          eq(tables.consultations.userId, user.id)
        )
      )
      .returning();

    if (!updated) {
      return c.json({ error: "Consultation not found" }, 404);
    }

    return c.json({ consultation: updated });
  });

  // ============================================
  // Analytics Routes
  // ============================================

  // Get score history
  app.get("/api/analytics/history", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const assessments = await edgespark.db
      .select()
      .from(tables.assessments)
      .where(eq(tables.assessments.userId, user.id))
      .orderBy(tables.assessments.createdAt);

    const history = [];
    for (const assessment of assessments) {
      const pillarScoresList = await edgespark.db
        .select()
        .from(tables.pillarScores)
        .where(eq(tables.pillarScores.assessmentId, assessment.id));

      const pillarScores: Record<string, number> = {};
      for (const ps of pillarScoresList) {
        pillarScores[ps.pillarKey] = ps.rawScore || 0;
      }

      history.push({
        date: new Date((assessment.createdAt || 0) * 1000).toISOString(),
        wealthScore: assessment.wealthScore,
        overallScore: assessment.overallScore,
        pillarScores,
      });
    }

    return c.json({ history });
  });

  // ============================================
  // Payment Routes (Placeholder - Enable when Stripe keys are configured)
  // ============================================

  // Checkout endpoint - placeholder until Stripe keys are added
  app.post("/api/checkout", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: Enable when SANDBOX_STRIPE_SECRET_KEY is configured
    // const stripeKey = edgespark.secret.get("SANDBOX_STRIPE_SECRET_KEY");
    // if (!stripeKey) {
    //   return c.json({ error: "Payments not configured" }, 503);
    // }

    // For now, return placeholder response
    return c.json({ 
      error: "Payments coming soon. This feature will be enabled before launch.",
      message: "Add SANDBOX_STRIPE_SECRET_KEY and SANDBOX_STRIPE_WEBHOOK_SECRET secrets to enable payments."
    }, 503);
  });

  // Check subscription status - placeholder
  app.get("/api/billing/subscription", async (c) => {
    const user = edgespark.auth.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user has premium access
    const profile = await edgespark.db
      .select()
      .from(tables.userProfiles)
      .where(eq(tables.userProfiles.userId, user.id))
      .get();

    return c.json({ 
      status: profile?.isPremium ? "active" : "none",
      isPremium: profile?.isPremium || false
    });
  });

  return app;
}
