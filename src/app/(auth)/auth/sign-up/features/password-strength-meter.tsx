import { motion } from "framer-motion";
import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter = ({
  password,
}: PasswordStrengthMeterProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, checks: [], color: "hsl(var(--muted))" };

    const checks = [
      { test: password.length >= 8, label: "At least 8 characters" },
      { test: /[a-z]/.test(password), label: "Lowercase letter" },
      { test: /[A-Z]/.test(password), label: "Uppercase letter" },
      { test: /\d/.test(password), label: "Number" },
      { test: /[^A-Za-z0-9]/.test(password), label: "Special character" },
    ];

    const score = checks.filter((check) => check.test).length;

    let color = "hsl(var(--destructive))";
    if (score >= 4) color = "hsl(var(--success))";
    else if (score >= 3) color = "hsl(var(--warning))";
    else if (score >= 2) color = "hsl(var(--accent))";

    return { score, checks, color };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className="font-medium" style={{ color: strength.color }}>
            {strength.score === 0 && "Very weak"}
            {strength.score === 1 && "Weak"}
            {strength.score === 2 && "Fair"}
            {strength.score === 3 && "Good"}
            {strength.score === 4 && "Strong"}
            {strength.score === 5 && "Very strong"}
          </span>
        </div>

        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${strength.color}, ${strength.color}88)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(strength.score / 5) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1">
        {strength.checks.map((check, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <motion.div
              className={`w-3 h-3 rounded-full flex items-center justify-center ${
                check.test
                  ? "bg-success/20 text-success"
                  : "bg-muted/30 text-muted-foreground"
              }`}
              animate={{ scale: check.test ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {check.test ? (
                <Check className="w-2 h-2" />
              ) : (
                <X className="w-2 h-2" />
              )}
            </motion.div>
            <span
              className={`${
                check.test
                  ? "text-success font-medium"
                  : "text-muted-foreground"
              } transition-colors duration-200`}
            >
              {check.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
