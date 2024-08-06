import React from 'react'
import PendingApproval from '../../../components/Tables/PendingApproval'
import DefaultLayout from '@/components/Layouts/DefaultLayout';


const page = () => {
    return (
        <div>

            <DefaultLayout>
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        Pending Approvals
                    </h4>
                <PendingApproval />
            </DefaultLayout>
        </div>
    )
}

export default page
