/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import router from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ArrayRightIcon, PlusIcon, SchoolIcon } from "../../../constants/icons";
import { MContract, MContractMembre, MFormation } from "../../../models/types";
import { trpc } from "../../../utils/trpc";
import { authOptions } from "../../api/auth/[...nextauth]";
import { prisma } from "../../../server/db/client";
import { SendIcon } from "../../../constants/icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Etablissement } from '@prisma/client';
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  }
  const id = context.query.contractId as string;

  console.log(id);

  console.log("equal", id == "93c7a937-d916-412a-bd20-f2950d24ca16");
  const test = await prisma?.contract.findUniqueOrThrow({
    where: {
      id,
    },
  });
  console.log("test", test);

  const contract = JSON.parse(
    JSON.stringify(
      await prisma?.contract.findUnique({
        where: {
          id,
        },
        include: {
          aboutissement: {
            include: {
              etablissement: true,
              versions: {
                include: {
                  diplome: true,
                },
              },
              diplome: true,
            },
          },
          membres: {
            include: {
              etablissement: true,
            },
          },
        },
      })
    )
  );

  const conditions = JSON.parse(
    JSON.stringify(
      await prisma?.formation.findMany({
        where: {
          id: {
            in: contract.conditionsId,
          },
        },
        include: {
          etablissement: true,
        },
      })
    )
  );
  const utilisateur = JSON.parse(
    JSON.stringify(
      await prisma?.utilisateur.findUnique({
        where: {
          email: session.user?.email || "",
        },
      })
    )
  );

  return {
    props: {
      id,
      contract,
      conditions,
      utilisateur,
      ...(await serverSideTranslations(context.locale || "", ["common"])),
    },
  };
};

type TAvis = "ATTENTE" | "CONFIRME" | "REFUSE" | "CONFIRME_CONDITION";

const Confirmation = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { t } = useTranslation();

  const [avis, setAvis] = useState<TAvis>("ATTENTE");
  useEffect(() => {
    const contract: MContract = props.contract;
    const c = contract.membres.filter(
      (m) => m.etablissementId == props.utilisateur.etablissementId
    )[0]?.avis;

    setAvis(c || "ATTENTE");
    // toast.warning(text("tous refuser"));
  }, []);

  const text = (s: string) => t("workspace.relation." + s);

  const { mutate: onConfirm, isLoading } = trpc.useMutation(
    ["contract.confirmation"],
    {
      onError: (err) => {
        toast.error(t("global.toast erreur"));
        console.log("err", err);
      },
      onSuccess(data) {
        console.log(data);

        // if (variables.confirmation) {
        //   toast.success("workspace.relation.vous avez confirme");
        // } else {
        //   toast.success("workspace.relation.vous avez refuse");
        // }
        router.push("/workspace/relation");
      },
    }
  );
  const onSelect = (avis: TAvis) => {
    const id = props.contract.membres.filter(
      (f: MContractMembre) =>
        f.etablissementId == props.utilisateur.etablissementId
    )[0].id;
    onConfirm({ avis, id });
  };
  return (
    <div className="relative w-screen flex flex-col items-center justify-center px-3 py-10 ">
      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="flex flex-col items-center">
          {(props.conditions as Array<MFormation>).map((f, i) => {
            return (
              <div key={i} className="">
                {i != 0 && <PlusIcon className="mx-auto my-[20px] icon" />}
                <FormationItem item={f} />
              </div>
            );
          })}
        </div>
        <ArrayRightIcon className="icon m-5 text-primary  rotate-90 lg:rotate-0" />
        <FormationItem
          item={props.contract.aboutissement}
          classCard="text-primary shadow-md"
        />
      </div>
      <br />
      <br />
      <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-10 py-4 lg:py-10 ">
        <button
          disabled={avis == "REFUSE"}
          onClick={() => onSelect("REFUSE")}
          className={`btn btn-outline btn-error ${isLoading && "loading"}`}
        >
          {text("refuser")}
        </button>
        <button
          disabled={avis == "ATTENTE"}
          onClick={() => onSelect("ATTENTE")}
          className={`btn btn-outline ${isLoading && "loading"}`}
        >
          {text("ATTENTE")}
        </button>
        <button
          disabled={avis == "CONFIRME"}
          onClick={() => onSelect("CONFIRME")}
          className={`btn btn-outline btn-primary ${isLoading && "loading"}`}
        >
          {text("accepter")}
        </button>
        <button
          disabled={avis == "CONFIRME_CONDITION"}
          onClick={() => onSelect("CONFIRME_CONDITION")}
          className={`btn btn-outline btn-info`}
        >
          {text("accepter condition")}
        </button>
      </div>
      <div className="divider" />

      <Chat contract={props.contract} props={props} />
    </div>
  );
};

export const FormationItem = ({
  item,
  classCard,
}: {
  item: MFormation;
  classCard?: string;
}) => {
  return (
    <div className={`border p-4 ${classCard}`}>
      <h6>{item.intitule}</h6>
      <div className="flex flex-row gap-2">
        <SchoolIcon />
        <p>{item.etablissement.nom}</p>
      </div>
    </div>
  );
};

type TChat = {
  contractId?: string;
  etablissementId?: string;
  contract: MContract;
  props: any;
};
const Chat = ({  contract, props }: TChat) => {
  const { t } = useTranslation();
  const {
    data: chats,
   
    refetch,
  } = trpc.useQuery(["contract.get chat", contract.id]);
  const { mutate: addChat, isLoading: isLoadingAdding } = trpc.useMutation(
    ["contract.add chat"],
    {
      onError: (err) => {
        toast.error(t("global.toast erreur"));
        console.log("err", err);
      },
      onSuccess: () => {
        refetch();
      },
    }
  );
  const [parent] = useAutoAnimate(/* optional config */);

  const [content, setcontent] = useState("");
  const onAdd = (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const c = contract.membres.filter(
      (m) => m.etablissementId == props.utilisateur.etablissementId
    )[0];
    setcontent("");
    console.log("etablissementId", c?.etablissementId);
    addChat({
      contractId: contract.id,
      etablissementId: c?.etablissementId || "",
      content,
    });
  };
  return (
    <div className="max-w-[700px] w-full p-4">
      <p className="py-1 pl-3 border-l-4 border-warning">
        {t("workspace.relation.chat")}
      </p>
      <div className="flex flex-col bg-base-200 min-h-[400px] w-full my-3 p-3 gap-3">
        <form onSubmit={onAdd} className="flex flex-row gap-3 items-center">
          <textarea
            value={content}
            onChange={(e) => setcontent(e.target.value)}
           
            placeholder={t("workspace.formation.saisir")}
            className="textarea w-full shadow-md"
          />
          <button type="submit" className="btn shadow-md">
            <SendIcon className={`icon ${isLoadingAdding&&"loading"}`} />
          </button>
        </form>
        {chats?.length == 0 ? (
          <div className="flex-grow flex justify-center items-center text-opacity-70 italic w-full">
            {t("workspace.relation.pas de chats")}
          </div>
        ) : (
          <div ref={parent as any} className="flex flex-col gap-5">
            {(chats || []).map((c, i) => {
                const date = new Date(
                  c.createAt.toString()
                ).toLocaleDateString()
              return (
                <div key={i} className="bg-base-300 rounded-lg p-4 w-auto">
                  <h6 className="text-[14px]">{(c as any).etablissement.nom}</h6>
                  <div className="divider h-0"/>
                 <p> {c.content}</p>
                 <div className="flex flex-row justify-end">
          <span className="text-opacity-50 italic text-sm text-green-800">{date}</span>
                 </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Confirmation;
