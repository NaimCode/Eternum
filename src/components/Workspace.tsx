import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import Nav from "../partials/Nav";
import SideBar from "../partials/SideBar";

type WorkSpaceProps = {
  children: ReactNode;
  breadcrumb?:boolean
};
const Workspace = ({ children,breadcrumb=true }: WorkSpaceProps) => {
  return (
    <>
      <div className="drawer drawer-mobile">
        <input
          placeholder="_"
          id="Menu"
          type="checkbox"
          className="drawer-toggle"
        />
        <main className="drawer-content relative bg-base-100">
          <Nav />
          {breadcrumb && <BreadCrumbs />}
          {children}
        </main>

        <div className="drawer-side">
          <label htmlFor="Menu" className="drawer-overlay"></label>

          <SideBar />
        </div>
      </div>
    </>
  );
};

const BreadCrumbs = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const routes = decodeURI(router.asPath)
    .split("/")
    .filter((f, i) => i >= 2);

  return (
    <div
      className={`${
        routes && routes.length <= 1 && "hidden"
      } text-xs lg:text-sm breadcrumbs p-3 lg:p-6`}
    >
      <ul className="gap-1">
        {routes.map((r, i) => {
          const isLast = i == routes.length - 1;
          const intern = ["ajouter"].includes(r);
          return (
            <li
              key={i}
              className="first-letter:uppercase max-w-[120px] lg:max-w-[220px]"
            >
              {isLast ? (
                <span className="truncate">
                  {intern ? t("global." + r) : r}
                </span>
              ) : (
                <Link
                  href={
                    "/workspace/" +
                    routes.filter((rn, index) => index <= i).join("/")
                  }
                 
                >
                  <a  className="truncate">{r}</a>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default Workspace;
