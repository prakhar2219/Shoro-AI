import BackToTop from "../backToTop";
import ReleaseNotesPage from "./index";

export const metadata = {
  title: "Release Notes - || AiWave - AI SaaS Website NEXTJS15 UI Kit",
  description: "AiWave - AI SaaS Website NEXTJS15 UI Kit",
};

const ReleaseNotesLayout = () => {
  return (
    <>
      <ReleaseNotesPage />
      <BackToTop />
    </>
  );
};

export default ReleaseNotesLayout;
