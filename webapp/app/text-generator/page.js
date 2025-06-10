import BackToTop from "../backToTop";
import TextGeneratorPage from "./index";

export const metadata = {
  title: "Text Generator - || AiWave - AI SaaS Website NEXTJS15 UI Kit",
  description: "AiWave - AI SaaS Website NEXTJS15 UI Kit",
};

const TextGeneratorLayout = () => {
  return (
    <>
      <TextGeneratorPage />
      <BackToTop />
    </>
  );
};

export default TextGeneratorLayout;
