import { faChevronLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";

import {
  Button,
  ErrorMessage,
  Field,
  FlexList,
  Input,
  ItemBox,
  Link,
} from "~/components";
import { verifyAccount } from "~/email/verify.server";
import { generateTokenLink, getUserByEmail } from "~/models/user.server";
import { getUser } from "~/session.server";
import { validateEmail } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";

export async function loader({ request }: LoaderFunctionArgs) {
  const urlSearchParams = new URL(request.url).searchParams;
  const email = urlSearchParams.get("email");
  const user = await getUser(request);

  return json({ email, user });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const honeyPot = formData.get("usercode");

  if (honeyPot) {
    return redirect("/");
  }

  if (!validateEmail(email)) {
    return json({
      errors: {
        email: "invalid email address",
      },
    });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return json({
      errors: {
        email: "User does not exist with this email",
      },
    });
  }

  const domainUrl = getDomainUrl(request);
  // send email
  const magicLink = await generateTokenLink(email, "join/verify", domainUrl);
  verifyAccount(email, magicLink);
  return redirect("/join/verificationSent");
}

export default function RequestVerification() {
  const { email, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const displayEmail = user?.email || email || "";
  return (
    <FlexList pad={4}>
      <FontAwesomeIcon icon={faEnvelope} size="5x" />
      <h1 className="text-center text-2xl font-bold">
        Request a verification email
      </h1>
      <p className="text-center text-sm text-slate-500">
        It looks like your account is not yet verified with us
      </p>
      <ItemBox>
        <Form method="put">
          <FlexList>
            <Field name="email" label="Email">
              <Input
                name="email"
                type="email"
                placeholder="Account email"
                defaultValue={displayEmail}
              />
              {actionData?.errors.email ? (
                <ErrorMessage message={actionData?.errors.email} />
              ) : null}
            </Field>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              className="absolute left-0 top-0 -z-10 h-0 w-0 opacity-0"
              htmlFor="usercode"
              aria-hidden="true"
              tabIndex={-1}
            >
              <input
                className="absolute left-0 top-0 -z-10 h-0 w-0 opacity-0"
                autoComplete="off"
                type="text"
                id="usercode"
                name="usercode"
                placeholder="Your code here"
                aria-hidden="true"
                tabIndex={-1}
              />
            </label>

            <Button kind="primary" type="submit">
              Send email
            </Button>
            <Link to="/login" kind="ghost" icon={faChevronLeft}>
              Back to log in
            </Link>
          </FlexList>
        </Form>
      </ItemBox>
    </FlexList>
  );
}
