import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import SingleInfo from "./SingleInfo";

const ContactInfo = () => {
  return (
    <div className="flex flex-col gap-4">
      <SingleInfo text="ayushkr2701@gmail.com" Image={HiOutlineMail} />
      <SingleInfo text="+919661879710" Image={FiPhone} />
      <SingleInfo text="119,Ramjaipal Nagar,Gola Road,Patna,Bihar,801503" Image={IoLocationOutline} />
    </div>
  );
};

export default ContactInfo;
