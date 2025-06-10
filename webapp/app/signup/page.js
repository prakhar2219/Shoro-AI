import BackToTop from "../backToTop";
import SignupPage from "./index";

export const metadata = {
  title: "Sign Up - || AiWave - AI SaaS Website NEXTJS15 UI Kit",
  description: "AiWave - AI SaaS Website NEXTJS15 UI Kit",
};

const SignupLayout = () => {
  return (
    <>
      <SignupPage />
      <BackToTop />
    </>
  );
};

export default SignupLayout;
