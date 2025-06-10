"use client";

import SignUp from "@/components/SignUp/SignUp";
import Context from "@/context/Context";

const SignupPage = () => {
  return (
    <Context>
      <SignUp />
    </Context>
  );
};

export default SignupPage;
