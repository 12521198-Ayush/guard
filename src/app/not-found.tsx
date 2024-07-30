import React from 'react';
import { Button, Result } from 'antd';
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from 'next/link';


const App: React.FC = () => (
    <DefaultLayout>
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Link
                    href="/"
                >
                    <Button >Back Home</Button>
                </Link>
            }
        />
    </DefaultLayout>
);

export default App;