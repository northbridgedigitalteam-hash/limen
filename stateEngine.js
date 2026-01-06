function inferState() {
  const history = Storage.get('sessionHistory') || [];
  const now = new Date();

  let probabilities = {
    "CognitiveOverdrive": 0,
    "EmotionalLoad": 0,
    "SomaticTension": 0,
    "Hypervigilance": 0,
    "DecisionFatigue": 0,
    "Understimulated": 0,
    "FragmentedFocus": 0,
    "RecoveryDebt": 0,
    "AnticipatoryStress": 0,
    "SocialDepletion": 0,
    "ShutdownDrift": 0,
    "Baseline": 0
  };

  // Simple deterministic rules
  if (history.length >= 3) {
    probabilities["CognitiveOverdrive"] += 0.7;
  }

  const hour = now.getHours();
  if (hour >= 22 || hour <= 6) probabilities["RecoveryDebt"] += 0.8;
  if (hour >= 7 && hour <= 9) probabilities["AnticipatoryStress"] += 0.6;

  // Pick highest score
  return Object.keys(probabilities).reduce((a, b) =>
    probabilities[a] > probabilities[b] ? a : b
  );
}
