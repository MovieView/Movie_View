import Spinner from '@/components/common/Spinner';
import SocialLogin from '@/components/login/SocialLogin';
import React, { Suspense } from 'react';

const LoginPage = () => {
  return (
    <Suspense fallback={<Spinner size='lg' item={true} />}>
      <SocialLogin />
    </Suspense>
  );
};

export default LoginPage;
