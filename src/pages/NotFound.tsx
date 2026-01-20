// import notFoundImage from "../../public/not-found.png";
import { PiHouseLineBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex grow items-center px-6 xl:px-10">
      <div className="mx-auto text-center">
        <img
          // src={notFoundImage}
          src="/not-found.png"
          alt="not found"
          className="mx-auto mb-8 aspect-[360/326] max-w-[256px] xs:max-w-[370px] lg:mb-12 2xl:mb-16"
        />
        <h1 className="text-[22px] font-bold leading-normal text-gray-1000 lg:text-3xl">
          Sorry, the page not found
        </h1>
        <p className="mt-3 text-sm leading-loose text-gray-500 lg:mt-6 lg:text-base lg:leading-loose">
          We have been spending long hours in order to launch our new website. Join our
          <br className="hidden sm:inline-block" />
          mailing list or follow us on Facebook for get latest update.
        </p>
        <button
          className="mt-8 mx-auto flex flex-row items-center gap-2 h-12 px-4 xl:h-14 xl:px-6 bg-blue-600 text-white rounded-md hover:bg-blue-900 transition duration-200 ease-in-out"
          onClick={() => navigate("/")}>
          <PiHouseLineBold className="text-lg" />
          Back to home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
