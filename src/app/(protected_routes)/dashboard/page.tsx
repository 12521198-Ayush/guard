import dynamic from 'next/dynamic';

const ECommerce = dynamic(() => import("../../../components/Dashboard/E-commerce"), { ssr: false });

const Page = () => {
  return <ECommerce />;
};

export default Page;
