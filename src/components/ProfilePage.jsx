"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const emptyAddress = {
  recipient_name: "",
  phone_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  label: "Home",
  is_default: false,
};

const avatarExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Feedback({ feedback }) {
  if (!feedback) return null;

  return (
    <p
      aria-live="polite"
      className={`rounded-xl px-4 py-3 text-sm ${
        feedback.type === "error"
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-800"
      }`}
      role={feedback.type === "error" ? "alert" : "status"}
    >
      {feedback.message}
    </p>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-60";

export default function ProfilePage({
  initialAddresses,
  initialEditProfile,
  initialError,
  initialProfile,
  user,
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [profileDraft, setProfileDraft] = useState({
    full_name: initialProfile.full_name,
    email: user.email,
    phone: initialProfile.phone,
    date_of_birth: initialProfile.date_of_birth,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(initialEditProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState(
    initialError ? { type: "error", message: initialError } : null,
  );
  const [addressDraft, setAddressDraft] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!profile.avatar_path) {
      return () => {
        isCurrent = false;
      };
    }

    createClient()
      .storage.from("gifterra-avatars")
      .createSignedUrl(profile.avatar_path, 60 * 60)
      .then(({ data, error }) => {
        if (!isCurrent) return;
        if (error) {
          setFeedback({ type: "error", message: error.message });
          return;
        }
        setAvatarUrl(data.signedUrl);
      })
      .catch((error) => {
        if (isCurrent) {
          setFeedback({
            type: "error",
            message: error instanceof Error ? error.message : "Could not load your profile picture.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [profile.avatar_path]);

  function updateProfileDraft(event) {
    const { name, value } = event.target;
    setProfileDraft((current) => ({ ...current, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setFeedback(null);
    if (!profileDraft.full_name.trim()) {
      setFeedback({ type: "error", message: "Full name is required." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDraft.email.trim())) {
      setFeedback({ type: "error", message: "Enter a valid email address." });
      return;
    }

    setIsSavingProfile(true);
    try {
      const supabase = createClient();
      const updatedProfile = {
        id: user.id,
        full_name: profileDraft.full_name.trim(),
        phone: profileDraft.phone.trim() || null,
        date_of_birth: profileDraft.date_of_birth || null,
        avatar_path: profile.avatar_path,
      };
      const { error } = await supabase.from("profiles").upsert(updatedProfile);
      if (error) throw error;

      setProfile(updatedProfile);
      setIsEditingProfile(false);
      if (profileDraft.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser(
          { email: profileDraft.email.trim() },
          { emailRedirectTo: `${window.location.origin}/auth/callback` },
        );
        if (emailError) {
          setFeedback({
            type: "error",
            message: `Your profile details were saved, but the email change could not be started: ${emailError.message}`,
          });
          return;
        }
        setFeedback({
          type: "success",
          message: "Your details were saved. Check your email to confirm the address change.",
        });
      } else {
        setFeedback({ type: "success", message: "Your personal information was saved." });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save your profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!avatarExtensions[file.type] || file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: "Choose a JPG, PNG, or WebP image smaller than 5 MB.",
      });
      return;
    }

    setFeedback(null);
    setIsUploadingAvatar(true);
    const supabase = createClient();
    const path = `${user.id}/${crypto.randomUUID()}.${avatarExtensions[file.type]}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("gifterra-avatars")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.full_name || user.email.split("@")[0],
        phone: profile.phone || null,
        date_of_birth: profile.date_of_birth || null,
        avatar_path: path,
      });
      if (profileError) {
        const { error: cleanupError } = await supabase.storage
          .from("gifterra-avatars")
          .remove([path]);
        if (cleanupError) {
          console.error("Could not remove an unreferenced profile image.", cleanupError);
        }
        throw profileError;
      }

      const previousPath = profile.avatar_path;
      setProfile((current) => ({
        ...current,
        full_name: current.full_name || user.email.split("@")[0],
        avatar_path: path,
      }));
      setFeedback({ type: "success", message: "Your profile picture was updated." });
      if (previousPath) {
        const { error: removeError } = await supabase.storage
          .from("gifterra-avatars")
          .remove([previousPath]);
        if (removeError) {
          setFeedback({
            type: "error",
            message: `Picture updated, but the previous image could not be removed: ${removeError.message}`,
          });
        }
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not upload your picture.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function startAddressEdit(address) {
    setEditingAddressId(address.id);
    setIsAddingAddress(false);
    setAddressDraft({
      recipient_name: address.recipient_name,
      phone_number: address.phone_number,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 ?? "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      label: address.label,
      is_default: address.is_default,
    });
    setFeedback(null);
  }

  function cancelAddressEdit() {
    setEditingAddressId(null);
    setIsAddingAddress(false);
    setAddressDraft(emptyAddress);
  }

  async function saveAddress(event) {
    event.preventDefault();
    setFeedback(null);
    const requiredAddressFields = [
      addressDraft.recipient_name,
      addressDraft.phone_number,
      addressDraft.address_line_1,
      addressDraft.city,
      addressDraft.state,
      addressDraft.postal_code,
      addressDraft.country,
    ];
    if (requiredAddressFields.some((value) => !value.trim())) {
      setFeedback({ type: "error", message: "Complete all required address fields." });
      return;
    }
    setIsSavingAddress(true);

    const addressValues = {
      ...addressDraft,
      recipient_name: addressDraft.recipient_name.trim(),
      phone_number: addressDraft.phone_number.trim(),
      address_line_1: addressDraft.address_line_1.trim(),
      address_line_2: addressDraft.address_line_2.trim() || null,
      city: addressDraft.city.trim(),
      state: addressDraft.state.trim(),
      postal_code: addressDraft.postal_code.trim(),
      country: addressDraft.country.trim(),
      user_id: user.id,
    };

    try {
      const supabase = createClient();
      const query = editingAddressId
        ? supabase
            .from("addresses")
            .update(addressValues)
            .eq("id", editingAddressId)
            .eq("user_id", user.id)
        : supabase.from("addresses").insert(addressValues);
      const { data, error } = await query.select().single();
      if (error) throw error;

      setAddresses((current) => {
        const updated = editingAddressId
          ? current.map((address) => (address.id === data.id ? data : address))
          : [data, ...current];
        return data.is_default
          ? updated.map((address) =>
              address.id === data.id ? address : { ...address, is_default: false },
            )
          : updated;
      });
      cancelAddressEdit();
      setFeedback({
        type: "success",
        message: editingAddressId ? "Address updated." : "Address added.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save the address.",
      });
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function deleteAddress(address) {
    if (!window.confirm(`Delete the ${address.label.toLowerCase()} address for ${address.recipient_name}?`)) {
      return;
    }
    setFeedback(null);
    try {
      const { error } = await createClient()
        .from("addresses")
        .delete()
        .eq("id", address.id)
        .eq("user_id", user.id);
      if (error) throw error;
      setAddresses((current) => current.filter((item) => item.id !== address.id));
      setFeedback({ type: "success", message: "Address deleted." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not delete the address.",
      });
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setFeedback(null);
    if (passwordDraft.password.length < 8) {
      setFeedback({ type: "error", message: "Use at least 8 characters for your password." });
      return;
    }
    if (passwordDraft.password !== passwordDraft.confirmPassword) {
      setFeedback({ type: "error", message: "Your passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await createClient().auth.updateUser({
        password: passwordDraft.password,
      });
      if (error) throw error;
      setPasswordDraft({ password: "", confirmPassword: "" });
      setFeedback({ type: "success", message: "Your password was changed." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not change your password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function signOut() {
    setFeedback(null);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.replace("/auth");
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not sign out.",
      });
    }
  }

  async function deleteAccount() {
    const confirmation = window.prompt(
      "This permanently deletes your Gifterra account and profile data. Type DELETE to continue.",
    );
    if (confirmation !== "DELETE") return;

    setIsDeletingAccount(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete your account.");
      if (result.warning) window.alert(result.warning);

      const { error: signOutError } = await createClient().auth.signOut({ scope: "local" });
      if (signOutError) {
        setFeedback({
          type: "error",
          message: `Account deleted, but this browser session could not be cleared: ${signOutError.message}`,
        });
        return;
      }
      router.replace("/auth");
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Could not delete your account.",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Your Gifterra account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">My profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Keep your details and delivery addresses up to date.
        </p>
        <div className="mt-5"><Feedback feedback={feedback} /></div>
      </section>

      <section
        id="personal-information"
        className="scroll-mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <SectionHeading eyebrow="Your details" title="Personal information">
          {!isEditingProfile ? (
            <button
              className={secondaryButtonClass}
              onClick={() => {
                setProfileDraft({
                  full_name: profile.full_name,
                  email: user.email,
                  phone: profile.phone,
                  date_of_birth: profile.date_of_birth,
                });
                setIsEditingProfile(true);
              }}
              type="button"
            >
              Edit details
            </button>
          ) : null}
        </SectionHeading>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-50 text-3xl font-semibold text-cyan-800">
            {avatarUrl ? (
              <Image
                alt="Your profile"
                className="h-full w-full object-cover"
                height={96}
                src={avatarUrl}
                unoptimized
                width={96}
              />
            ) : (
              (profile.full_name || user.email).slice(0, 1).toUpperCase()
            )}
          </div>
          <div>
            <label className={`${secondaryButtonClass} cursor-pointer`}>
              {isUploadingAvatar ? "Uploading..." : "Upload profile picture"}
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isUploadingAvatar}
                onChange={uploadAvatar}
                type="file"
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP up to 5 MB.</p>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={saveProfile}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="profile-name">Full name</label>
              <input
                className={inputClass}
                disabled={!isEditingProfile}
                id="profile-name"
                maxLength={120}
                name="full_name"
                onChange={updateProfileDraft}
                required
                value={profileDraft.full_name}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-email">Email address</label>
              <input
                className={inputClass}
                disabled={!isEditingProfile}
                id="profile-email"
                name="email"
                onChange={updateProfileDraft}
                type="email"
                value={profileDraft.email}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-phone">Phone number (optional)</label>
              <input
                autoComplete="tel"
                className={inputClass}
                disabled={!isEditingProfile}
                id="profile-phone"
                name="phone"
                onChange={updateProfileDraft}
                type="tel"
                value={profileDraft.phone}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="profile-dob">Date of birth (optional)</label>
              <input
                className={inputClass}
                disabled={!isEditingProfile}
                id="profile-dob"
                max={new Date().toISOString().slice(0, 10)}
                name="date_of_birth"
                onChange={updateProfileDraft}
                type="date"
                value={profileDraft.date_of_birth}
              />
            </div>
          </div>
          {isEditingProfile ? (
            <div className="flex flex-wrap gap-3">
              <button className={primaryButtonClass} disabled={isSavingProfile} type="submit">
                {isSavingProfile ? "Saving..." : "Save changes"}
              </button>
              <button
                className={secondaryButtonClass}
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileDraft({
                    full_name: profile.full_name,
                    email: user.email,
                    phone: profile.phone,
                    date_of_birth: profile.date_of_birth,
                  });
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          ) : null}
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionHeading eyebrow="Delivery" title="Saved addresses">
          {!editingAddressId && !isAddingAddress ? (
            <button
              className={primaryButtonClass}
              onClick={() => {
                setAddressDraft(emptyAddress);
                setIsAddingAddress(true);
                setFeedback(null);
              }}
              type="button"
            >
              Add address
            </button>
          ) : null}
        </SectionHeading>

        {addresses.length ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {addresses.map((address) => (
              <article key={address.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{address.recipient_name}</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {address.label}
                      </span>
                      {address.is_default ? (
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {address.address_line_1}
                      {address.address_line_2 ? <><br />{address.address_line_2}</> : null}
                      <br />{address.city}, {address.state} {address.postal_code}
                      <br />{address.country}
                      <br />{address.phone_number}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      className="text-sm font-semibold text-cyan-800 hover:text-cyan-950"
                      onClick={() => startAddressEdit(address)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm font-semibold text-red-700 hover:text-red-900"
                      onClick={() => deleteAddress(address)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">No saved addresses yet</p>
            <p className="mt-1 text-sm text-slate-600">Add a delivery address to make checkout easier.</p>
          </div>
        )}

        {editingAddressId || isAddingAddress ? (
            <form className="mt-6 rounded-2xl border border-slate-200 p-5" onSubmit={saveAddress}>
              <h3 className="text-lg font-semibold text-slate-900">
                {editingAddressId ? "Edit address" : "New address"}
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["recipient_name", "Recipient name", "text"],
                  ["phone_number", "Phone number", "tel"],
                  ["address_line_1", "Address line 1", "text"],
                  ["address_line_2", "Address line 2 (optional)", "text"],
                  ["city", "City", "text"],
                  ["state", "State / region", "text"],
                  ["postal_code", "PIN / postal code", "text"],
                  ["country", "Country", "text"],
                ].map(([name, label, type]) => (
                  <div key={name} className={name.startsWith("address_line") ? "sm:col-span-2" : ""}>
                    <label className={labelClass} htmlFor={`address-${name}`}>{label}</label>
                    <input
                      autoComplete={
                        name === "recipient_name"
                          ? "name"
                          : name === "phone_number"
                            ? "tel"
                            : name === "address_line_1"
                              ? "address-line1"
                              : name === "address_line_2"
                                ? "address-line2"
                                : name === "city"
                                  ? "address-level2"
                                  : name === "state"
                                    ? "address-level1"
                                    : name === "postal_code"
                                      ? "postal-code"
                                      : name === "country"
                                        ? "country-name"
                                        : "off"
                      }
                      className={inputClass}
                      id={`address-${name}`}
                      maxLength={180}
                      name={name}
                      onChange={(event) =>
                        setAddressDraft((current) => ({
                          ...current,
                          [name]: event.target.value,
                        }))
                      }
                      required={name !== "address_line_2"}
                      type={type}
                      value={addressDraft[name]}
                    />
                  </div>
                ))}
                <div>
                  <label className={labelClass} htmlFor="address-label">Address label</label>
                  <select
                    className={inputClass}
                    id="address-label"
                    onChange={(event) =>
                      setAddressDraft((current) => ({ ...current, label: event.target.value }))
                    }
                    value={addressDraft.label}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 self-end pb-3 text-sm font-medium text-slate-700">
                  <input
                    checked={addressDraft.is_default}
                    className="h-4 w-4 accent-cyan-700"
                    onChange={(event) =>
                      setAddressDraft((current) => ({
                        ...current,
                        is_default: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Make this my default address
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className={primaryButtonClass} disabled={isSavingAddress} type="submit">
                  {isSavingAddress ? "Saving..." : "Save address"}
                </button>
                <button className={secondaryButtonClass} onClick={cancelAddressEdit} type="button">
                  Cancel
                </button>
              </div>
            </form>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionHeading eyebrow="Purchases" title="My orders" />
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-800">Order history is not connected yet</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            There is no database-backed order table in this project. Existing checkout history is
            stored only in this browser, so it cannot be safely presented as authenticated account
            history. No orders are being fabricated.
          </p>
          <Link className="mt-4 inline-flex font-semibold text-cyan-800 hover:text-cyan-950" href="/products">
            Browse gifts
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionHeading eyebrow="Security" title="Account settings" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form className="space-y-4" onSubmit={changePassword}>
            <h3 className="font-semibold text-slate-900">Change password</h3>
            <div>
              <label className={labelClass} htmlFor="new-password">New password</label>
              <input
                autoComplete="new-password"
                className={inputClass}
                id="new-password"
                minLength={8}
                onChange={(event) =>
                  setPasswordDraft((current) => ({ ...current, password: event.target.value }))
                }
                required
                type="password"
                value={passwordDraft.password}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="confirm-new-password">Confirm new password</label>
              <input
                autoComplete="new-password"
                className={inputClass}
                id="confirm-new-password"
                onChange={(event) =>
                  setPasswordDraft((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                required
                type="password"
                value={passwordDraft.confirmPassword}
              />
            </div>
            <button className={primaryButtonClass} disabled={isChangingPassword} type="submit">
              {isChangingPassword ? "Updating..." : "Update password"}
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">More from your account</h3>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-800">Wishlist</p>
              <p className="mt-1 text-sm text-slate-600">
                Saved products are not available yet; this project has no wishlist feature.
              </p>
            </div>
            <button className={secondaryButtonClass} onClick={signOut} type="button">
              Sign out
            </button>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-red-800">Delete account</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Permanently remove your account, personal profile, and saved addresses.
              </p>
              <button
                className="mt-3 inline-flex rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                disabled={isDeletingAccount}
                onClick={deleteAccount}
                type="button"
              >
                {isDeletingAccount ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
        {feedback ? <div className="mt-5"><Feedback feedback={feedback} /></div> : null}
      </section>
    </main>
  );
}
