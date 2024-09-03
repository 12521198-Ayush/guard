import React from 'react'
import PendingApproval from "../../../../components/Tables/PendingApproval"


const page = () => {
    return (
        <div>

            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                Pending Approvals
            </h4>
            <PendingApproval />
        </div>
    )
}

export default page
