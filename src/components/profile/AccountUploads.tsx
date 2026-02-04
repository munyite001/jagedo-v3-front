import { Download, FileText, Upload, Eye, Image } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalProvider";
import { MOCK_UPLOADS } from "@/pages/mockUploads";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const DocumentCard = ({ label, url, onReplace }) => {
  const fileName = url?.split("/").pop();

  if (!url) {
    // Empty state - needs upload
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Image className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{label}</h4>
            <p className="text-xs text-gray-500">Not uploaded</p>
          </div>
        </div>
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-blue-300 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition">
              <Upload className="w-4 h-4" />
              Upload
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplace(file);
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  // Uploaded state
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">{label}</h4>
          <p className="text-xs text-gray-500 truncate">{fileName}</p>
        </div>
      </div>

      {/* Action buttons - View, Download, Replace */}
      <div className="flex gap-2 flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 border border-gray-200 rounded-lg text-gray-700 text-xs font-medium hover:bg-gray-50 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </a>
        <a
          href={url}
          download={fileName}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-2 border border-gray-200 rounded-lg text-gray-700 text-xs font-medium hover:bg-gray-50 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </a>
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center justify-center gap-1 py-2 px-2 border border-blue-200 rounded-lg text-blue-600 text-xs font-medium hover:bg-blue-50 transition">
            <Upload className="w-3.5 h-3.5" />
            Replace
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onReplace(file);
            }}
          />
        </label>
      </div>
    </div>
  );
};

const AccountUploads = () => {
  const { user } = useGlobalContext();
  const userType = user?.userType?.toLowerCase();

  /* ---------------- NON-CONTRACTORS ---------------- */
  if (userType !== "contractor") {
    const [documents, setDocuments] = useState({});

    useEffect(() => {
      setDocuments(
        JSON.parse(localStorage.getItem(`docs-${userType}`)) ||
        MOCK_UPLOADS[userType] ||
        {}
      );
    }, [userType]);

    const replaceDocument = (file, key) => {
      const url = URL.createObjectURL(file);
      const updated = { ...documents, [key]: url };
      setDocuments(updated);
      localStorage.setItem(`docs-${userType}`, JSON.stringify(updated));
      
      // ✅ NEW: Also save to the expected storage key for completion tracking
      localStorage.setItem(`uploads_demo_${user?.id}`, JSON.stringify(updated));
      
      // ✅ DON'T trigger status update here - wait for Save button click
    };

    const handleSaveDocuments = () => {
      // Save documents to localStorage
      localStorage.setItem(`docs-${userType}`, JSON.stringify(documents));
      localStorage.setItem(`uploads_demo_${user?.id}`, JSON.stringify(documents));
      
      // Trigger completion status update
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Uploads saved successfully');
    };

    const defaultFields = {
      customer: [
        { label: "Business Permit", key: "businessPermit" },
        { label: "Certificate of Incorporation", key: "certificateOfIncorporation" },
        { label: "KRA PIN", key: "kraPIN" },
      ],
      fundi: [
        { label: "ID Front", key: "idFrontUrl" },
        { label: "ID Back", key: "idBackUrl" },
        { label: "Certificate", key: "certificateUrl" },
        { label: "KRA PIN", key: "kraPIN" },
      ],
      professional: [
        { label: "ID Front", key: "idFrontUrl" },
        { label: "ID Back", key: "idBackUrl" },
        { label: "Academics Certificate", key: "academicCertificateUrl" },
        { label: "CV", key: "cvUrl" },
        { label: "KRA PIN", key: "kraPIN" },
      ],
      hardware: [
        { label: "Business Registration", key: "businessRegistration" },
        { label: "KRA PIN", key: "kraPIN" },
        { label: "Single Business Permit", key: "singleBusinessPermit" },
        { label: "Company Profile", key: "companyProfile" },
      ],
    };

    const fields = defaultFields[userType] || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Uploaded Documents</h1>
              <p className="text-sm text-gray-500 mt-1">
                ID documents, certificates, and portfolio items
              </p>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {fields.map(f => (
                <DocumentCard
                  key={f.key}
                  label={f.label}
                  url={documents[f.key]}
                  onReplace={file => replaceDocument(file, f.key)}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveDocuments}
                className="bg-blue-800 text-white px-8 py-3 rounded-md hover:bg-blue-900 transition font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- CONTRACTORS ONLY ---------------- */

  const [documents, setDocuments] = useState({});
  const [categoryDocs, setCategoryDocs] = useState({});
  const [categories, setCategories] = useState([]);

  const loadCategories = () => {
    // Try to load categories from ContractorExperience data first
    const experienceData = JSON.parse(localStorage.getItem(`contractorExperience_${user?.id}`) || "null");
    if (experienceData?.categories && experienceData.categories.length > 0) {
      // Extract category names from contractor experience
      const categoryNames = experienceData.categories
        .filter((cat: any) => cat.category)
        .map((cat: any) => cat.category);
      setCategories(categoryNames);
    } else {
      // Fallback to old storage key
      setCategories(
        JSON.parse(localStorage.getItem("contractor-categories") || "[]")
      );
    }
  };

  useEffect(() => {
    setDocuments(
      JSON.parse(localStorage.getItem(`docs-contractor`) || "{}")
    );

    loadCategories();

    setCategoryDocs(
      JSON.parse(localStorage.getItem("contractor-category-docs") || "{}")
    );

    // Listen for storage changes to update categories
    const handleStorageChange = () => {
      loadCategories();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

  const replaceDocument = (file, key) => {
    const url = URL.createObjectURL(file);
    const updated = { ...documents, [key]: url };
    setDocuments(updated);
    localStorage.setItem("docs-contractor", JSON.stringify(updated));
    
    // ✅ NEW: Also save to the expected storage key for completion tracking
    localStorage.setItem(`uploads_demo_${user?.id}`, JSON.stringify(updated));
    
    // ✅ DON'T trigger status update here - wait for Save button click
  };

  const replaceCategoryDoc = (category, type, file) => {
    const url = URL.createObjectURL(file);
    const updated = {
      ...categoryDocs,
      [category]: {
        ...categoryDocs[category],
        [type]: url
      }
    };
    setCategoryDocs(updated);
    localStorage.setItem("contractor-category-docs", JSON.stringify(updated));
    
    // ✅ NEW: Also save to the expected storage key for completion tracking
    localStorage.setItem(`uploads_demo_${user?.id}`, JSON.stringify(updated));
    
    // ✅ DON'T trigger status update here - wait for Save button click
  };

  const handleSaveDocuments = () => {
    // Save all documents to localStorage
    localStorage.setItem("docs-contractor", JSON.stringify(documents));
    localStorage.setItem("contractor-category-docs", JSON.stringify(categoryDocs));
    localStorage.setItem(`uploads_demo_${user?.id}`, JSON.stringify({
      ...documents,
      ...categoryDocs
    }));
    
    // Trigger completion status update
    window.dispatchEvent(new Event('storage'));
    
    toast.success('Uploads saved successfully');
  };

  const generalFields = [
    { label: "Business Registration", key: "businessRegistration" },
    { label: "Business Permit", key: "businessPermit" },
    { label: "KRA PIN", key: "kraPIN" },
    { label: "Company Profile", key: "companyProfile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Contractor Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Company documents, certificates, and licenses
            </p>
          </div>

          {/* Section 1 - Company Documents */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Company Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generalFields.map(f => (
                <DocumentCard
                  key={f.key}
                  label={f.label}
                  url={documents[f.key]}
                  onReplace={file => replaceDocument(file, f.key)}
                />
              ))}
            </div>
          </div>

          {/* Section 2 - Category Documents */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">
              Category Licences & Certificates
            </h3>

            {categories.length === 0 && (
              <p className="text-sm text-gray-500">
                Add categories in Experience section to unlock uploads.
              </p>
            )}

            {categories.map(cat => (
              <div key={cat} className="border rounded-xl p-5 mb-6 bg-white">
                <h4 className="font-semibold mb-4 text-gray-800">{cat}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentCard
                    label={`${cat} Certificate`}
                    url={categoryDocs?.[cat]?.certificate}
                    onReplace={file =>
                      replaceCategoryDoc(cat, "certificate", file)
                    }
                  />

                  <DocumentCard
                    label={`${cat} Practice License`}
                    url={categoryDocs?.[cat]?.license}
                    onReplace={file =>
                      replaceCategoryDoc(cat, "license", file)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveDocuments}
              className="bg-blue-800 text-white px-8 py-3 rounded-md hover:bg-blue-900 transition font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountUploads;
