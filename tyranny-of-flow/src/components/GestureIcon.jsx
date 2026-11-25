import { motion } from "motion/react";

/** 각 인터랙션 동작을 나타내는 라인 아이콘 (active일 때 반복 애니메이션) */
export function GestureIcon({ kind, active = true, color = "currentColor", className = "h-10 w-10" }) {
  const loop = { repeat: Infinity, repeatType: "mirror", duration: 1.4, ease: "easeInOut" };

  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {kind === "approach" && (
        <>
          <rect x="34" y="12" width="8" height="24" />
          <motion.g animate={active ? { x: [0, 8] } : { x: 0 }} transition={loop}>
            <circle cx="12" cy="13" r="4" />
            <path d="M12 18v12M12 30l-4 9M12 30l4 9M12 22l-5 4M12 22l5 4" />
          </motion.g>
        </>
      )}
      {kind === "turn" && (
        <>
          <motion.g animate={active ? { rotate: [-22, 22] } : { rotate: 0 }} transition={loop} style={{ originX: "24px", originY: "26px" }}>
            <circle cx="24" cy="22" r="10" />
            <path d="M20 21h.01M28 21h.01" strokeWidth="3" />
          </motion.g>
          <path d="M8 40c4-3 28-3 32 0" />
          <path d="M6 22l-3 3 3 3M42 22l3 3-3 3" />
        </>
      )}
      {kind === "palm" && (
        <motion.g animate={active ? { scale: [0.9, 1.05] } : { scale: 1 }} transition={loop} style={{ originX: "24px", originY: "30px" }}>
          <path d="M16 26V12a2.5 2.5 0 015 0v12M21 23V9a2.5 2.5 0 015 0v14M26 23V11a2.5 2.5 0 015 0v13M31 25v-8a2.5 2.5 0 015 0v13c0 7-5 12-12 12h-1c-4 0-7-2-9-5l-5-8a2.5 2.5 0 014-3l3 3" />
        </motion.g>
      )}
      {kind === "down" && (
        <>
          <motion.g animate={active ? { y: [-6, 6] } : { y: 0 }} transition={loop}>
            <path d="M18 8v10a6 6 0 0012 0V8M18 12h12" />
          </motion.g>
          <path d="M24 30v12M19 37l5 5 5-5" />
        </>
      )}
      {kind === "stand" && (
        <>
          {/* 사람: 자리에 내려와 서는 듯 살짝 위아래로 */}
          <motion.g animate={active ? { y: [-2, 1] } : { y: 0 }} transition={{ ...loop, duration: 1.8 }}>
            <circle cx="24" cy="10" r="4" />
            <path d="M24 15v13M24 28l-5 10M24 28l5 10M24 19l-6 5M24 19l6 5" />
          </motion.g>
          {/* 바닥 표시: 은은하게 깜빡임 */}
          <motion.ellipse
            cx="24" cy="42" rx="12" ry="3"
            animate={active ? { opacity: [1, 0.35] } : { opacity: 1 }}
            transition={{ ...loop, duration: 1.8 }}
          />
        </>
      )}
      {kind === "camera" && (
        <>
          <rect x="8" y="14" width="32" height="22" rx="2" />
          <circle cx="24" cy="25" r="6" />
          <motion.circle cx="24" cy="25" r="2" fill={color} animate={active ? { opacity: [1, 0.2] } : {}} transition={loop} />
        </>
      )}
      {kind === "slow" && (
        <>
          <circle cx="24" cy="24" r="15" />
          {/* 분침: 시계 중심(24,24)을 기준으로 천천히 회전 */}
          <path d="M24 24V13">
            {active && (
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="28s" repeatCount="indefinite" />
            )}
          </path>
          {/* 시침: 같은 중심에서 훨씬 느리게 회전 */}
          <path d="M24 24l5 3.5">
            {active && (
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="160s" repeatCount="indefinite" />
            )}
          </path>
          <circle cx="24" cy="24" r="1.2" fill={color} stroke="none" />
        </>
      )}
    </svg>
  );
}
