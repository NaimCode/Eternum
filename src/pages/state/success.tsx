
import { motion } from "framer-motion";
import { useLottie } from "lottie-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import dataAnimation from "../../../public/lotties/success.json";
import { HomeIcon } from "../../constants/icons";


export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
const Success = () => {
  const {t} = useTranslation()
  const router=useRouter()

  const {query}=router
  let text=''

 if(query){

  switch (query.type) {
    case 'inscription':
      text="state.Success inscription"
      break;
      case 'inscription-accepted':
        text="state.Success inscription accepte"
        break;
    default:
      break;
  }
 }
  
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-6 text-center">
     <motion.div initial={{
      y:100,
      scale:0.8
     }} animate={{y:0,scale:1}} transition={{
      duration:0.5
     }} className="max-w-[200px] md:max-w-[300px]">
     <Animation />
     </motion.div>
  
    
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4,duration:0.4}}>
      <div className="py-[20px] md:py-[50px] w-full md:max-w-xl md:text-lg ">
      {t(text)}
      </div>
      <button title="Eternum" onClick={()=>{
        router.push("/")
      }} className="btn btn-outline gap-3">
        <HomeIcon className="icon"/>
      </button>
      </motion.div>
    </div>
  );
};

const Animation = () => {
  const options = {
    animationData: dataAnimation,
    loop:true,
  };

  const { View } = useLottie(options);

  return <>{View}</>;
};
export default Success;
