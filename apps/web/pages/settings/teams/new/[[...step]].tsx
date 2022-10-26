import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// import TeamGeneralSettings from "@calcom/features/teams/createNewTeam/TeamGeneralSettings";
import AddNewTeamMembers from "@calcom/features/ee/teams/components/v2/AddNewTeamMembers";
import CreateNewTeam from "@calcom/features/ee/teams/components/v2/CreateNewTeam";
import { FormValues } from "@calcom/features/ee/teams/lib/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Form } from "@calcom/ui/v2/core/form";
import { SkeletonContainer, SkeletonText } from "@calcom/ui/v2/core/skeleton";

import { StepCard } from "@components/getting-started/components/StepCard";
import { Steps } from "@components/getting-started/components/Steps";

const INITIAL_STEP = "create-a-new-team";
// TODO: Add teams general settings "general-settings"
const steps = ["create-a-new-team", "add-team-members"] as const;

const stepTransform = (step: typeof steps[number]) => {
  const stepIndex = steps.indexOf(step);
  if (stepIndex > -1) {
    return steps[stepIndex];
  }
  return INITIAL_STEP;
};

const stepRouteSchema = z.object({
  step: z.array(z.enum(steps)).default([INITIAL_STEP]),
});

const CreateNewTeamPage = () => {
  const router = useRouter();

  const { t } = useLocale();
  const [teamId, setTeamId] = useState<number>();

  const formMethods = useForm<FormValues>();

  // const { data: user, isLoading } = trpc.useQuery(["viewer.me"], {
  //   onSuccess: () => {
  //     if (user) {
  //       formMethods.setValue("members", [
  //         { name: user.name, emailOrUsername: user.username, role: "OWNER", avatar: user.avatar },
  //       ]);
  //     }
  //   },
  // });

  useEffect(() => {
    console.log(formMethods.getValues());
  }, [formMethods]);

  const result = stepRouteSchema.safeParse(router.query);
  const currentStep = result.success ? result.data.step[0] : INITIAL_STEP;

  const headers = [
    {
      title: `${t("create_new_team")}`,
      subtitle: [`${t("create_new_team_description")}`],
    },
    // {
    //   title: `${t("general_settings")}`,
    //   subtitle: [`${t("general_settings_description")}`],
    // },
    {
      title: `${t("add_team_members")}`,
      subtitle: [`${t("add_team_members_description")}`],
    },
  ];

  const goToIndex = (index: number) => {
    const newStep = steps[index];
    router.push(
      {
        pathname: `/settings/teams/new/${stepTransform(newStep)}`,
      },
      undefined
    );
  };

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="dark:bg-brand dark:text-brand-contrast min-h-screen text-black"
      data-testid="onboarding"
      key={router.asPath}>
      <Head>
        <title>Create a new Team</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto px-4 py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
            <div className="mx-auto sm:max-w-[520px]">
              <header>
                <p className="font-cal mb-3 text-[28px] font-medium leading-7">
                  {headers[currentStepIndex]?.title || "Undefined title"}
                </p>

                <p className="font-sans text-sm font-normal text-gray-500">
                  {headers[currentStepIndex]?.subtitle}
                </p>
              </header>
              <Steps maxSteps={steps.length} currentStep={currentStepIndex} navigateToStep={goToIndex} />
            </div>
            <Form
              form={formMethods}
              onSubmit={(values) => {
                console.log("🚀 ~ file: [[...step]].tsx ~ line 105 ~ CreateNewTeamPage ~ values", values);
              }}>
              <StepCard>
                {currentStep === "create-a-new-team" && (
                  <CreateNewTeam
                    nextStep={() => {
                      goToIndex(1);
                    }}
                    setTeamId={(teamId: number) => setTeamId(teamId)}
                  />
                )}

                {/* {currentStep === "general-settings" && (
                <TeamGeneralSettings teamId={teamId} nextStep={() => goToIndex(2)} />
              )} */}

                {currentStep === "add-team-members" && <AddNewTeamMembers />}
              </StepCard>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewTeamPage;

const NewTeamSkeleton = () => {
  return (
    <SkeletonContainer className="rounded-md border">
      <div className="flex w-full justify-between p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            <SkeletonText className="h-4 w-56" />
          </p>
          <div className="mt-2.5 w-max">
            <SkeletonText className="h-5 w-28" />
          </div>
        </div>
      </div>
    </SkeletonContainer>
  );
};
