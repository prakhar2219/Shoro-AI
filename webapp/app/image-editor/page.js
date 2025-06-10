import BackToTop from "../backToTop";
import ImageEditorPage from "./index";

export const metadata = {
  title: "Image Editor - || AiWave - AI SaaS Website NEXTJS15 UI Kit",
  description: "AiWave - AI SaaS Website NEXTJS15 UI Kit",
};

const ImageEditorLayout = () => {
  return (
    <>
      <ImageEditorPage />
      <BackToTop />
    </>
  );
};

export default ImageEditorLayout;
