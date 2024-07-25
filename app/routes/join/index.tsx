import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { getUserId } from "~/session.server";

import {
  createUser,
  generateTokenLink,
  getUserByEmail,
} from "~/models/user.server";
import { validateEmail } from "~/utils";
import { Button, FlexList, PasswordStrength } from "~/components";
import {
  getDomainUrl,
  getPasswordError,
  passwordStrength,
} from "~/utils/password";
import invariant from "tiny-invariant";
import { verifyAccount } from "~/email/verify.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  const honeyPot = formData.get("usercode");
  // const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  invariant(process.env.RESEND_API_KEY, "resend api key must be set");

  if (honeyPot) {
    return redirect("/");
  }

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null, name: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required", name: null } },
      { status: 400 }
    );
  }

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { email: null, password: null, name: "Name is required" } },
      { status: 400 }
    );
  }

  const { tests } = passwordStrength(password);
  const passwordError = getPasswordError(tests);

  if (passwordError) {
    return json(
      {
        errors: {
          email: null,
          password: passwordError,
          name: null,
        },
        success: false,
      },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
          name: null,
        },
        success: false,
      },
      { status: 400 }
    );
  }

  await createUser(email, password, name);
  const domainUrl = getDomainUrl(request);
  // send email
  const magicLink = await generateTokenLink(email, "join/verify", domainUrl);
  verifyAccount(email, magicLink);

  return redirect("verificationSent");
}
export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const [password, setPassword] = React.useState("");

  const { tests, strength } = passwordStrength(password);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Name
            </label>
            <div className="mt-1">
              <input
                ref={nameRef}
                id="name"
                required
                autoFocus={true}
                name="name"
                type="string"
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
                className="input input-bordered w-full"
              />
              {actionData?.errors?.name && (
                <div className="pt-1 text-error" id="name-error">
                  {actionData.errors.name}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="input input-bordered w-full"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-error" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="input input-bordered w-full"
              />
              <div className="pt-2">
                <PasswordStrength tests={tests} strength={strength} />
              </div>
              {actionData?.errors?.password && (
                <div className="pt-1 text-error" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

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

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <FlexList>
            <Button type="submit" kind="primary" size="md">
              Create Account
            </Button>
          </FlexList>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                className="link link-accent"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
