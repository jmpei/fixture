// Shared domain types. Rule IDs come from docs/league-rules.md.
export type RuleId = "S1" | "S2" | "F1" | "F2" | "B1";

export type Violation = { ruleId: RuleId; message: string };
