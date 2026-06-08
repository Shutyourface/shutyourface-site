type MailchimpSignupProps = {
  variant: "header" | "footer";
};

const mailchimpAction = "https://shutyourface.us20.list-manage.com/subscribe/post?u=700f921c0d1892d2eeedf81d1&id=19479c1d0a&f_id=00be32eef0";

export function MailchimpSignup({ variant }: MailchimpSignupProps) {
  const isFooter = variant === "footer";

  return (
    <form action={mailchimpAction} method="post" target="_blank" className={isFooter ? "flex gap-3" : "mt-2 flex gap-2"}>
      <input aria-label={isFooter ? "Footer email address" : "Header email address"} type="email" name="EMAIL" required placeholder="Enter your email" className={isFooter ? "min-h-12 flex-1 px-4 text-black" : "min-w-0 flex-1 border border-black px-2 py-2 text-sm text-black"} />
      <div className="absolute left-[-5000px]" aria-hidden="true">
        <input type="text" name="b_700f921c0d1892d2eeedf81d1_19479c1d0a" tabIndex={-1} defaultValue="" />
      </div>
      <button type="submit" name="subscribe" className={isFooter ? "bg-red-700 px-5 font-tabloid text-2xl uppercase text-white hover:bg-white hover:text-black" : "bg-red-700 px-3 py-2 font-tabloid text-lg uppercase text-white hover:bg-black"}>
        {isFooter ? "Subscribe now" : "Subscribe"}
      </button>
    </form>
  );
}
