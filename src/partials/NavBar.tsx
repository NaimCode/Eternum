import { signIn, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import ThemeSwitcher from "../components/ThemeSwitcher";
import LanguageChanger from "../components/LanguageChanger";

import Logo,{LogoBrand} from "../components/Logo";
import { FileIcon } from "../constants/icons";

const NavBar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const handleSignIn = () => {
    if (session) {
      router.push("/workspace");
    } else {
      signIn("google", { callbackUrl: "/workspace" })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const { t } = useTranslation();
  return (
    <div className="navbar z-50 backdrop-blur-md  bg-base-100/60  fixed top-0 left-0">
      <div
        className={`container max-w-7xl mx-auto h-full flex flex-row items-center justify-between gap-3`}
      >
     <LogoBrand/>
        <div className="flex-grow"></div>
        <ThemeSwitcher/>
        <LanguageChanger />
       
        <button onClick={handleSignIn} className="btn btn-primary">
          {t("home.Button workspace")}
        </button>
      </div>
    </div>
  );
};

export default NavBar