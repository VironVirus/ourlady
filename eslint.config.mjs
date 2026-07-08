import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", ".st-camillus-work/**", "node_modules/**"]
  }
];

export default config;
