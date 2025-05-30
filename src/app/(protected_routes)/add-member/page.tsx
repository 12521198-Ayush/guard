import FamilyMemberForm from './FamilyMemberForm';

export default function AddMemberPage() {
    return (
        <div className="bg-white p-3 font-sans relative ">
            <div className="p-4 space-y-4 max-w-md mx-auto">
                <div className="flex justify-center mb-6 ">
                    <h2 className="text-lg font-semibold text-gray-700"> Add Member</h2>
                    <br />
                </div>
                <div className="space-y-4 overflow-y-auto pb-20" style={{ height: '75vh' }}>
                    <FamilyMemberForm />
                </div>
            </div>
        </div>
    );
}
