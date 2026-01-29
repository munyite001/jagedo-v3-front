 /* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { AiOutlinePaperClip } from "react-icons/ai";
import { FaFileAlt } from "react-icons/fa";

const getFileNameFromUrl = (url: string) => {
    try {
        return decodeURIComponent(url.split('/').pop() || "attachment");
    } catch {
        return "attachment";
    }
};

interface SubmissionsProps {
    selectedBid: any;
}


const Submissions = ({ selectedBid }: SubmissionsProps) => {
    const serviceProviderNotes = selectedBid?.notes;
    const serviceProviderAttachments = selectedBid?.attachments;

    return (
        <div className="bg-gray-50/50 py-6 px-4">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 border border-gray-200">

                <header className="border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Service Provider's Submission
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        This section displays the notes and documents provided by the service provider for Bid #{selectedBid?.id}. This information is read-only.
                    </p>
                </header>

                <div className="space-y-6">
                    {/* --- Service Provider's Notes Section --- */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Service Provider Notes
                        </h3>
                        <div className="min-h-[120px] bg-gray-100 p-4 rounded-md border text-gray-800">
                            {serviceProviderNotes ? (
                                <p className="whitespace-pre-wrap text-sm">{serviceProviderNotes}</p>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>No notes were provided by the service provider.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Service Provider's Attachments Section --- */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Service Provider Attachments
                        </h3>
                        <div className="min-h-[120px] bg-gray-100 p-4 rounded-md border">
                            {serviceProviderAttachments && serviceProviderAttachments.length > 0 ? (
                                <ul className="space-y-2">
                                    {serviceProviderAttachments.map((url: string, index: number) => (
                                        <li key={index} className="flex items-center bg-white p-2.5 rounded-md shadow-sm border border-gray-200">
                                            <AiOutlinePaperClip className="text-gray-600 mr-3 flex-shrink-0 text-lg" />
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm truncate"
                                                title={getFileNameFromUrl(url)}
                                            >
                                                {getFileNameFromUrl(url)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                                    <FaFileAlt className="text-3xl mb-2" />
                                    <p>No attachments were submitted by the service provider.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Submissions;