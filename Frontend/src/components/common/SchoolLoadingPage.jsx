import React, { useEffect, useRef, useState } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  extendTheme,
} from "@chakra-ui/react";

const MESSAGES = [
  "Sharpening pencils…",
  "Opening lockers…",
  "Alphabetizing the library…",
  "Ringing the first bell…",
  "Taking attendance…",
  "Unpacking the classroom…",
];

const theme = extendTheme({
  fonts: {
    heading: "'Fraunces', serif",
    body: "'Work Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  colors: {
    paper: "#FAF6EC",
    paperLine: "#E3DCC8",
    ink: "#1B2A4A",
    inkSoft: "#4A5570",
    pencil: "#E8B94A",
    chalkGreen: "#2F5233",
    ruleRed: "#B1503D",
  },
});

export default function SchoolLoadingPage() {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [statusText, setStatusText] = useState(MESSAGES[0]);
  const underlineRef = useRef(null);
  const [underlineLen, setUnderlineLen] = useState(1);

  useEffect(() => {
    if (underlineRef.current) {
      setUnderlineLen(underlineRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = Math.min(100, prev + (Math.random() * 9 + 3));

        if (next >= 100) {
          setStatusText("Welcome in.");
        } else if (Math.random() < 0.35) {
          setMsgIndex((mi) => {
            const nextIndex = Math.min(mi + 1, MESSAGES.length - 1);
            setStatusText(MESSAGES[nextIndex]);
            return nextIndex;
          });
        }
        return next;
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  const dashOffset = underlineLen * (1 - progress / 100);

  return (
    <Flex
      h="100vh"
      w="100%"
      align="center"
      justify="center"
      position="relative"
      overflow="hidden"
      bg="paper"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes draw { to { stroke-dashoffset: 0; } }
        .draw-path { stroke-dasharray: 220; stroke-dashoffset: 220; animation: draw 1.4s ease forwards; }
        .draw-tassel { stroke-dasharray: 40; stroke-dashoffset: 40; animation: draw 0.5s ease forwards 1.1s; }
        @media (prefers-reduced-motion: reduce) {
          .draw-path, .draw-tassel { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>

      <Box
        position="absolute"
        inset={0}
        opacity={0.7}
        pointerEvents="none"
        bgImage="repeating-linear-gradient(to bottom, transparent 0px, transparent 28px, #E3DCC8 28px, #E3DCC8 29px)"
      />
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={{ base: "8%", md: "12%" }}
        w="1px"
        bg="ruleRed"
        opacity={0.3}
      />

      <VStack
        as="main"
        role="status"
        aria-live="polite"
        spacing={4}
        px={5}
        position="relative"
        zIndex={1}
      >
        <Box as="svg" w="44px" h="44px" viewBox="0 0 100 100" aria-hidden="true">
          <path
            className="draw-path"
            d="M10 40 L50 22 L90 40 L50 58 Z"
            fill="none"
            stroke="#1B2A4A"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="draw-path"
            d="M25 47 L25 66 Q50 80 75 66 L75 47"
            fill="none"
            stroke="#1B2A4A"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            className="draw-tassel"
            x1="90"
            y1="40"
            x2="90"
            y2="66"
            stroke="#E8B94A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            className="draw-tassel"
            d="M90 66 Q84 72 88 78"
            fill="none"
            stroke="#E8B94A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Box>

        <Box textAlign="center">
          <Heading
            as="h1"
            fontSize={{ base: "1.5rem", md: "2rem" }}
            fontWeight="700"
            lineHeight="1"
            letterSpacing="-0.01em"
            color="ink"
          >
            El Faouar School
          </Heading>

          <Box as="svg" mt="1" h="12px" w="100%" viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
            <path
              ref={underlineRef}
              d="M4 10 Q 60 4, 120 9 T 296 8"
              fill="none"
              stroke="#E8B94A"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ strokeDasharray: underlineLen, strokeDashoffset: dashOffset }}
            />
          </Box>

          <Text
            mt={1}
            fontFamily="mono"
            fontSize="0.65rem"
            textTransform="uppercase"
            letterSpacing="0.14em"
            color="inkSoft"
          >
            Est. in curiosity
          </Text>
        </Box>

        <HStack fontFamily="mono" spacing={3}>
          <Text minW="140px" textAlign="right" fontSize="0.7rem" color="inkSoft">
            {statusText}
          </Text>

          <Box position="relative" h="2px" w={{ base: "40vw", md: "200px" }} bg="paperLine">
            <Box
              position="absolute"
              inset="0 auto 0 0"
              h="100%"
              w={`${progress}%`}
              bg="ink"
              transition="width 0.2s ease-out"
            >
              <Box
                position="absolute"
                right="-3px"
                top="50%"
                transform="translateY(-50%)"
                w="6px"
                h="6px"
                borderRadius="full"
                bg="pencil"
                boxShadow="0 0 0 2px #FAF6EC"
              />
            </Box>
          </Box>

          <Text minW="34px" fontSize="0.78rem" fontWeight="500" color="chalkGreen">
            {Math.floor(progress)}%
          </Text>
        </HStack>

        <Text as="span" srOnly>
          Loading, {Math.floor(progress)} percent complete
        </Text>
      </VStack>
    </Flex>
  );
}
