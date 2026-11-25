import { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  AnimatePresence,
} from 'motion/react';
import FlowCanvas from './components/FlowCanvas.jsx';
import { GestureIcon } from './components/GestureIcon.jsx';

const img = (name) => `${import.meta.env.BASE_URL}images/${name}.webp`;
const ease = [0.22, 1, 0.36, 1];

/* ───────────────────────── 공통 ───────────────────────── */

function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, delay, ease }}
    >
      {children}
    </M>
  );
}

function Eyebrow({ children, className = '' }) {
  return (
    <Reveal
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] ${className}`}
    >
      <span className="h-px w-8 bg-current opacity-50" />
      {children}
    </Reveal>
  );
}

/** 마우스 위치에 따라 3D로 기울어지는 카드 */
function Tilt({ children, max = 10, className = '' }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────── 네비게이션 ───────────────────────── */

function Nav() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const links = [
    ['#about', '작품'],
    ['#before', '시작하기 전에'],
    ['#guide', '체험 가이드'],
    ['#read', '화면 읽기'],
  ];
  return (
    <>
      <motion.div
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-red"
      />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 mix-blend-difference">
        <div className="flex items-center justify-between px-6 py-5 text-white md:px-12">
          <a
            href="#top"
            className="pointer-events-auto font-mono text-[11px] tracking-[0.3em]"
          >
            흐름의 폭정 — VISITOR GUIDE
          </a>
          <nav className="pointer-events-auto hidden gap-8 font-mono text-[11px] md:flex">
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="opacity-60 transition-opacity hover:opacity-100"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}

/* ───────────────────────── 히어로 ───────────────────────── */

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // 스크롤하면 화면이 뒤로 눕듯 기울어지며 멀어짐
  const rotX = useTransform(scrollYProgress, [0, 1], [0, 38]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.72]);
  const radius = useTransform(scrollYProgress, [0, 0.4], [0, 4]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const title = '흐름의 폭정'.split('');

  return (
    <section id="top" ref={ref} className="relative h-[130svh] bg-ink">
      <div className="sticky top-0 h-[100svh] overflow-hidden [perspective:1400px]">
        <motion.div
          style={{
            rotateX: rotX,
            scale,
            borderRadius: radius,
            transformOrigin: '50% 100%',
          }}
          className="absolute inset-0 overflow-hidden bg-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.4 }}
        >
          <FlowCanvas interactive density={1.1} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent" />
        </motion.div>

        <motion.div
          style={{ y: textY, opacity: fade }}
          className="relative z-10 flex h-full flex-col justify-between px-6 pb-10 pt-24 md:px-12 md:pb-12"
        >
          {/* 제목 위치 유지를 위한 빈 자리 (justify-between 레이아웃) */}
          <div aria-hidden="true" className="font-mono text-[11px]">&nbsp;</div>

          <div>
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 0.6, letterSpacing: '0.6em' }}
              transition={{ delay: 0.5, duration: 1.8, ease }}
              className="font-mono text-xs text-paper md:text-sm"
            >
              TYRANNY OF FLOW
            </motion.p>
            <h1 className="mt-4 flex font-serif text-[17vw] font-normal leading-[0.95] tracking-[-0.03em] md:text-[10rem]">
              {title.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 80, rotateX: -80 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.7 + i * 0.08, duration: 1.2, ease }}
                  style={{
                    transformOrigin: '50% 100%',
                    display: 'inline-block',
                  }}
                  className={ch === ' ' ? 'w-[0.28em]' : ''}
                >
                  {ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1, ease }}
              className="mt-8 max-w-md text-base leading-relaxed text-paper/70 md:text-lg"
            >
              우리는 얼마나 주체적으로 정보를 받아들이고 있나요?
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex items-end justify-between gap-6"
          >
            {/* 작품 캡션 (wall label) */}
            <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-[12px] text-paper/55">
              <dt className="font-mono text-paper/35">작품</dt>
              <dd>흐름의 폭정 Tyranny of Flow, 2026</dd>
              <dt className="font-mono text-paper/35">매체</dt>
              <dd>실시간 생성 영상, 3D 입자, 신체 추적</dd>
              <dt className="font-mono text-paper/35">도구</dt>
              <dd>TouchDesigner × MediaPipe</dd>
              <dt className="font-mono text-paper/35">작가</dt>
              <dd>D조 — 김화랑, 김나현, 최현아, YuXuanMing, ZhangLanDan</dd>
            </dl>
            <a
              href="#guide"
              className="group hidden shrink-0 items-center gap-3 rounded-full border border-paper/25 px-5 py-3 text-sm text-paper/90 backdrop-blur transition-colors hover:border-red-bright hover:bg-red-bright/10 md:flex"
            >
              체험 방법 보기
              <span className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── 작품 소개 + 3D 레이어 ───────────────────────── */

const LAYERS = [
  {
    tag: 'FRAME',
    text: '“AI가 디자이너를 대체한다?”',
    who: '엔터테인먼트 매체',
  },
  { tag: 'FRAME', text: '“지금 꼭 써봐야 할 신기능”', who: '마케팅 계정' },
  { tag: 'FRAME', text: '“업무 효율의 새로운 기준”', who: '공식 매체' },
];

function LayerStack() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const gap = useTransform(scrollYProgress, [0.15, 0.6], [14, 78]);
  const rotZ = useTransform(scrollYProgress, [0, 1], [-38, -26]);

  return (
    <div
      ref={ref}
      className="relative mx-auto flex h-[440px] w-full max-w-[520px] items-center justify-center [perspective:1600px] md:h-[560px]"
    >
      <motion.div
        style={{ rotateX: 58, rotateZ: rotZ, transformStyle: 'preserve-3d' }}
        className="relative h-[220px] w-[300px] md:h-[260px] md:w-[360px]"
      >
        {/* 가장 아래: 사실 */}
        <div className="absolute inset-0 flex flex-col justify-between bg-paper p-6 shadow-[0_40px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-ink/10">
          <p className="font-mono text-[10px] tracking-[0.2em] text-red">
            FACT · 2026.11.10
          </p>
          <p className="font-serif text-lg leading-snug text-ink md:text-xl">
            Adobe, 창작 도구의 로컬 MCP 통합 기능{' '}
            <span className="bg-fact px-1">프리뷰</span> 발표
          </p>
        </div>
        {LAYERS.map((l, i) => (
          <Layer key={i} l={l} i={i} gap={gap} />
        ))}
      </motion.div>
    </div>
  );
}

function Layer({ l, i, gap }) {
  const z = useTransform(gap, (g) => (i + 1) * g);
  return (
    <motion.div
      style={{ translateZ: z }}
      className="absolute inset-0 flex flex-col justify-between border border-ink/15 bg-sand/80 p-6 backdrop-blur-[2px] shadow-[0_30px_50px_-25px_rgba(0,0,0,0.3)]"
    >
      <p className="font-mono text-[10px] tracking-[0.2em] text-ink/45">
        {l.tag} · {l.who}
      </p>
      <p className="font-serif text-lg text-ink/80 md:text-xl">{l.text}</p>
    </motion.div>
  );
}

function About() {
  return (
    <section id="about" className="relative bg-wall py-28 text-ink md:py-44">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:px-12 lg:grid-cols-2">
        <div>
          <Eyebrow className="text-red">About the work</Eyebrow>
          <Reveal
            as="h2"
            delay={0.05}
            className="mt-6 font-serif text-4xl font-normal leading-[1.25] md:text-6xl"
          >
            수많은 목소리에
            <br />
            가려진{' '}
            <span className="bg-[linear-gradient(transparent_62%,var(--color-fact)_62%,var(--color-fact)_88%,transparent_88%)]">
              사실
            </span>
          </Reveal>
          <Reveal
            delay={0.1}
            className="mt-10 max-w-lg space-y-5 text-[15px] leading-[1.9] text-ink/70 md:text-base"
          >
            <p>
              하나의 사건도 매체마다 다른 이야기로 전해집니다. 2026년 11월,
              Adobe가 창작 도구에 AI 에이전트를 연결하는 기능을 발표하자
              누군가는 <em className="not-italic text-ink">효율</em>을, 누군가는{' '}
              <em className="not-italic text-ink">새로운 기능</em>을, 누군가는{' '}
              <em className="not-italic text-ink">일자리</em>를 이야기했습니다.
            </p>
            <p>
              이 작품은 그 이야기들이 붉은 실을 타고 끝없이 복제되며 사실을 덮어
              가는 모습을 보여줍니다. 그리고 묻습니다.{' '}
              <span className="text-ink">
                우리는 얼마나 스스로 판단하고 있을까요?
              </span>
            </p>
          </Reveal>
          <Reveal
            delay={0.2}
            className="mt-8 font-mono text-[11px] text-ink/40"
          >
            ↘ 하나의 사실 위에 해석이 겹겹이 쌓입니다. 스크롤하면 층이
            벌어집니다.
          </Reveal>
        </div>
        <LayerStack />
      </div>
      <p className="mx-auto mt-6 max-w-7xl px-6 text-right font-mono text-[10px] text-ink/35 md:px-12">
        * 매체별 헤드라인은 프레이밍을 설명하기 위한 예시입니다.
      </p>
    </section>
  );
}

/* ───────────────────────── 시작하기 전에 ───────────────────────── */

const TIPS = [
  {
    icon: 'stand',
    title: '화면 정면에 서세요',
    body: '스크린 앞, 카메라가 당신을 볼 수 있는 자리에 섭니다. 한 번에 한 사람씩 체험해 주세요.',
  },
  {
    icon: 'camera',
    title: '카메라가 당신을 읽습니다',
    body: '화면 앞 웹캠이 당신의 위치, 고개의 방향, 손의 모양을 실시간으로 인식합니다.',
  },
  {
    icon: 'slow',
    title: '천천히 움직이세요',
    body: '동작을 크고 천천히 할수록 흐름이 더 정확하게 반응합니다. 동작마다 잠시 머물러 보세요.',
  },
];

function Before() {
  return (
    <section id="before" className="bg-wall pb-28 text-ink md:pb-40">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="border-t border-ink/15 pt-16">
          <Eyebrow className="text-red">Before you start</Eyebrow>
          <Reveal
            as="h2"
            delay={0.05}
            className="mt-6 font-serif text-3xl font-normal md:text-5xl"
          >
            시작하기 전에
          </Reveal>
        </div>
        <div className="mt-14 grid gap-px bg-ink/10 md:grid-cols-3">
          {TIPS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.9, delay: i * 0.12, ease }}
              className="group bg-wall p-8 transition-colors duration-500 hover:bg-paper md:p-10"
            >
              <div className="flex items-start justify-between">
                <GestureIcon
                  kind={t.icon}
                  className="h-12 w-12 text-ink/80 transition-colors group-hover:text-red"
                />
                <span className="font-mono text-[11px] text-ink/30">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-10 text-lg font-semibold">{t.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {t.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 체험 가이드 ───────────────────────── */

const STEPS = [
  {
    key: 'approach',
    no: '01',
    verb: '다가가 보세요',
    how: '화면을 향해 천천히 걸어 들어오세요.',
    see: '느리던 카드와 붉은 실이 점점 빨라지며 당신을 둘러쌉니다.',
    think: '미디어에 다가가는 순간, 우리는 이미 수많은 정보에 둘러싸입니다.',
    tip: '멀리서부터 한 걸음씩 다가오면 변화가 더 잘 느껴져요.',
    image: 'step1',
  },
  {
    key: 'turn',
    no: '02',
    verb: '고개를 돌려 보세요',
    how: '고개를 왼쪽, 오른쪽으로 천천히 돌려 보세요.',
    see: '시점이 당신의 시선을 따라가다 빠른 흐름에 끌려갑니다. 다른 카드들은 시야 밖으로 밀려납니다.',
    think: '하나의 관점을 좇는 동안, 당신은 무엇을 놓치고 있나요?',
    tip: '한쪽 방향을 오래 바라보면 그 흐름에 더 깊이 끌려갑니다.',
    image: 'step2',
  },
  {
    key: 'palm',
    no: '03',
    verb: '손바닥을 펴 보세요',
    how: '한 손을 들어 카메라를 향해 손바닥을 활짝 펴고, 잠시 그대로 멈춰 있으세요.',
    see: '흐름이 느려지고 화면이 고요해지며, 카드 더미 아래 가려져 있던 사실이 드러납니다.',
    think: '멈춰야 비로소 비교하고, 의심하고, 판단할 수 있습니다.',
    tip: '손바닥이 카메라를 정면으로 향하게 해 주세요.',
    image: 'step3',
  },
  {
    key: 'down',
    no: '04',
    verb: '손을 내려 보세요',
    how: '펼쳤던 손을 천천히 내려 보세요.',
    see: '급류가 다시 살아나고, 붉은 실과 카드가 사실을 다시 덮어 버립니다.',
    think:
      '우리는 흐름을 잠시 멈출 수 있지만, 흐름의 규칙까지 바꿀 수는 없습니다.',
    tip: '다시 손을 펴면 언제든 흐름을 멈출 수 있어요.',
    image: 'step4',
  },
];

// 단계별 3D 스크린 자세
const POSE = {
  idle: { rotateY: -18, rotateX: 8, scale: 0.94 },
  approach: { rotateY: -6, rotateX: 3, scale: 1.04 },
  turn: { rotateY: -28, rotateX: 5, scale: 0.98 },
  palm: { rotateY: 0, rotateX: 0, scale: 1 },
  down: { rotateY: -12, rotateX: 14, scale: 1.02 },
};

function FactWindow({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="fact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute inset-0 z-10 flex items-center justify-center gap-3 p-4 md:gap-4"
        >
          <motion.p
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 0.7 }}
            transition={{ delay: 0.9, duration: 0.8, ease }}
            className="hidden max-w-[120px] border border-paper/20 p-3 font-serif text-xs text-paper/80 sm:block"
          >
            <span className="mb-1 block font-mono text-[9px] text-red-bright">
              FRAME A
            </span>
            “창작자의 해방”
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease }}
            className="max-w-[260px] bg-paper p-4 text-ink shadow-[0_0_80px_rgba(244,223,78,0.25)]"
          >
            <p className="font-mono text-[9px] tracking-widest text-red">
              FACT · 2026.11.10
            </p>
            <p className="mt-2 font-serif text-sm leading-snug md:text-base">
              Adobe, 외부 AI 에이전트가 창작 도구 작업에 참여하는 로컬 MCP 통합
              기능 <span className="bg-fact px-1">프리뷰</span> 발표
            </p>
          </motion.div>
          <motion.p
            initial={{ x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: 0.7 }}
            transition={{ delay: 1, duration: 0.8, ease }}
            className="hidden max-w-[120px] border border-paper/20 p-3 font-serif text-xs text-paper/80 sm:block"
          >
            <span className="mb-1 block font-mono text-[9px] text-red-bright">
              FRAME B
            </span>
            “일자리의 위기”
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 벽 앞에 떠 있는 3D 스크린 — 단계에 따라 각도가 바뀜 */
function Stage({ active }) {
  const step = STEPS.find((s) => s.key === active);
  const pose = POSE[active] || POSE.idle;

  return (
    <div className="relative flex h-full w-full items-center justify-center [perspective:1800px]">
      <motion.div
        animate={pose}
        transition={{ duration: 1.4, ease }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative aspect-[16/10] w-full max-w-[640px]"
      >
        {/* 스크린 */}
        <div className="absolute inset-0 overflow-hidden bg-ink shadow-[0_70px_100px_-40px_rgba(0,0,0,0.55)] ring-1 ring-black">
          <FlowCanvas mode={active} density={0.9} />
          <FactWindow show={active === 'palm'} />
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 font-mono text-[10px] text-paper/70">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-red-bright" />
            {step ? `LIVE · ${step.no}` : 'STANDBY'}
          </div>
        </div>

        {/* 앞으로 떠 있는 안내 카드 */}
        <AnimatePresence mode="wait">
          {step && (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease }}
              style={{ translateZ: 90 }}
              className="absolute -bottom-8 -left-3 z-30 flex items-center gap-4 bg-paper py-3 pl-3 pr-6 text-ink shadow-[0_30px_50px_-20px_rgba(0,0,0,0.4)] md:-left-10"
            >
              <span className="flex h-12 w-12 items-center justify-center bg-red text-paper">
                <GestureIcon kind={step.key} className="h-8 w-8" />
              </span>
              <span>
                <span className="block font-mono text-[10px] tracking-widest text-red">
                  TRY {step.no}
                </span>
                <span className="block font-serif text-lg md:text-xl">
                  {step.verb}
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 뒤쪽에 떠 있는 실제 테스트 화면 */}
        <AnimatePresence mode="wait">
          {step && (
            <motion.figure
              key={step.image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ translateZ: 50 }}
              className="absolute -right-4 -top-10 z-20 hidden w-[36%] md:block lg:-right-10"
            >
              <img
                src={img(step.image)}
                alt={`${step.verb} — 실제 테스트 화면`}
                className="w-full shadow-[0_25px_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-black/40"
              />
              <figcaption className="mt-2 font-mono text-[9px] text-ink/45">
                실제 테스트 화면
              </figcaption>
            </motion.figure>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 바닥 그림자 */}
      <div className="pointer-events-none absolute bottom-[8%] left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-2xl" />
    </div>
  );
}

function StepBlock({ step, onActive }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onActive(step.key);
  }, [inView, onActive, step.key]);

  return (
    <div
      ref={ref}
      className="flex min-h-[85vh] flex-col justify-center py-14 lg:min-h-screen"
    >
      <motion.div
        animate={{ opacity: inView ? 1 : 0.25 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-baseline gap-5">
          <span
            className="font-serif text-7xl leading-none text-transparent md:text-8xl"
            style={{
              WebkitTextStroke: inView
                ? '1px #c8221f'
                : '1px rgba(14,13,13,0.3)',
            }}
          >
            {step.no}
          </span>
          <span className="font-mono text-[11px] tracking-[0.25em] text-ink/40">
            TRY
          </span>
        </div>
        <h3 className="mt-6 font-serif text-4xl font-normal md:text-5xl">
          {step.verb}
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-ink/85">{step.how}</p>

        <div className="mt-10 grid gap-6 border-t border-ink/15 pt-6 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-ink/40">
              보게 될 것
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
              {step.see}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-red">
              생각해 볼 것
            </p>
            <p className="mt-2 font-serif text-[17px] leading-relaxed text-ink">
              {step.think}
            </p>
          </div>
        </div>

        <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink/[0.04] px-4 py-2 text-[13px] text-ink/60">
          <span className="font-mono text-[10px] text-red">TIP</span>
          {step.tip}
        </p>
      </motion.div>
    </div>
  );
}

function Guide() {
  const [active, setActive] = useState('idle');
  const idx = STEPS.findIndex((s) => s.key === active);

  return (
    <section id="guide" className="relative bg-wall text-ink">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="border-t border-ink/15 pt-16">
          <Eyebrow className="text-red">How to experience</Eyebrow>
          <Reveal
            as="h2"
            delay={0.05}
            className="mt-6 font-serif text-3xl font-normal md:text-5xl"
          >
            네 가지 동작을 순서대로 시도해 보세요
          </Reveal>
          <Reveal
            delay={0.1}
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/60"
          >
            흐름 속으로 들어가고, 뒤쫓고, 멈추고, 다시 놓아 보세요. 각 동작은
            우리가 정보를 대하는 방식에 대한 작은 질문입니다.
          </Reveal>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:px-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div className="sticky top-0 z-20 -mx-6 h-[46vh] bg-wall px-8 pb-6 pt-16 md:mx-0 lg:h-screen lg:bg-transparent lg:px-0 lg:py-0">
          <Stage active={active} />
          {/* 진행 표시 */}
          <div className="absolute bottom-2 left-8 flex items-center gap-3 lg:bottom-16 lg:left-0">
            {STEPS.map((s, i) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    i <= idx ? 'bg-red' : 'bg-ink/20'
                  }`}
                />
                <span
                  className={`hidden font-mono text-[10px] transition-colors sm:inline ${i === idx ? 'text-ink' : 'text-ink/30'}`}
                >
                  {s.no}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="pb-24 lg:pb-48">
          {STEPS.map((s) => (
            <StepBlock key={s.key} step={s} onActive={setActive} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 화면 읽기 ───────────────────────── */

const ELEMENTS = [
  {
    name: '뉴스 이미지 카드',
    body: '한 사건을 다룬 여러 기사와 관점',
    image: 'cards',
  },
  {
    name: '붉은 실',
    body: '정보를 실어 나르고 증폭하는 매체, 그리고 확산 경로',
    image: 'thread',
  },
  {
    name: '실에 끌려가는 카드',
    body: '같은 사건이 매체마다 다른 방향으로 흘러가는 모습',
    image: 'cluster',
  },
  {
    name: '겹겹이 쌓이는 이미지',
    body: '반복될수록 오히려 사실이 보이지 않게 되는 상태',
    image: 'layered',
  },
];

function ReadTheScreen() {
  return (
    <section id="read" className="bg-ink py-28 text-paper md:py-44">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <Eyebrow className="text-red-bright">Reading the screen</Eyebrow>
        <Reveal
          as="h2"
          delay={0.05}
          className="mt-6 font-serif text-3xl font-normal md:text-5xl"
        >
          화면 속 요소가 뜻하는 것
        </Reveal>

        <div className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {ELEMENTS.map((el, i) => (
            <motion.article
              key={el.name}
              initial={{ opacity: 0, y: 50, rotateX: 25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 1.1, delay: i * 0.12, ease }}
              style={{ transformPerspective: 1000 }}
            >
              <Tilt max={12}>
                <div className="relative aspect-[4/5] overflow-hidden bg-ink-2 shadow-[0_40px_60px_-30px_rgba(0,0,0,0.9)] ring-1 ring-paper/10">
                  <img
                    src={img(el.image)}
                    alt={`${el.name} — 프로토타입 화면`}
                    loading="lazy"
                    className="h-full w-full scale-110 object-cover"
                  />
                  <span
                    className="absolute left-4 top-4 font-mono text-[10px] text-paper/70"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    0{i + 1}
                  </span>
                </div>
              </Tilt>
              <h3 className="mt-6 text-lg font-semibold">{el.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/55">
                {el.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 마무리 ───────────────────────── */

function Closing() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  });
  const blur = useTransform(scrollYProgress, [0, 0.8], [12, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <FlowCanvas mode="palm" density={0.6} />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-32 md:px-12">
        <Eyebrow className="text-red-bright">After the experience</Eyebrow>
        <motion.h2
          style={{ filter }}
          className="mt-8 font-serif text-4xl font-normal leading-[1.3] md:text-7xl"
        >
          당신은 무엇을 보았고,
          <br />
          무엇을 <span className="text-fact">놓쳤나요?</span>
        </motion.h2>
        <Reveal
          delay={0.1}
          className="mt-12 max-w-xl space-y-4 text-[15px] leading-[1.9] text-paper/60 md:text-base"
        >
          <p>
            ‘폭정’은 특정 언론이나 기업을 향한 비난이 아니라, 끊임없이 주목과
            반응을 요구하는 정보 환경에 대한 은유입니다. 더 많이 본다고 더 많이
            이해하는 것은 아니며, 목소리가 크다고 더 믿을 만한 것도 아닙니다.
          </p>
          <p>전시장을 나선 뒤에도, 흐름 속에서 잠시 손을 펴 보세요.</p>
        </Reveal>
      </div>

      <footer className="relative border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-[12px] text-paper/45 md:flex-row md:items-center md:justify-between md:px-12">
          <p>
            <span className="font-serif text-base text-paper">흐름의 폭정</span>
            <span className="ml-3 font-mono tracking-[0.3em] text-red-bright">
              TYRANNY OF FLOW
            </span>
          </p>
          <p>
            REAL-TIME GRAPHICS · D조 · 김화랑 · 김나현 · 최현아 · YuXuanMing ·
            ZhangLanDan
          </p>
        </div>
      </footer>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Before />
      <Guide />
      <ReadTheScreen />
      <Closing />
    </main>
  );
}
