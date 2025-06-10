"use client";

import Signin from "@/components/SignIn/SignIn";
import Context from "@/context/Context";

const SigninPage = () => {
  return (
    <>
      <Context>
        <Signin />
      </Context>
    </>
  );
};

export default SigninPage;
