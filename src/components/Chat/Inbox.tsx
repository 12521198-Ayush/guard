import Link from "next/link";
import Image from "next/image";
import { Chat } from "@/types/chat";

const chatData: Chat[] = [
  {
    avatar: "/images/user/user-01.png",
    name: "Devid Heilo",
    text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eius, ullam?",
    body: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab nesciunt veritatis, deleniti aliquid ratione modi placeat quo error corporis magni. Debitis quisquam nobis accusamus laborum sapiente voluptatem inventore. Fugit animi eaque, necessitatibus dolorum cumque harum. Debitis minima a molestias, voluptatem similique harum, nam placeat eos officia dolorum nemo sit quos?",
    time: 12,
    textCount: 3,
    dot: 3,
  },
  {
    avatar: "/images/user/user-02.png",
    name: "Henry Fisher",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, voluptatibus.",
    body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dolores incidunt veritatis consequuntur iusto impedit, ipsam facilis aliquam expedita temporibus quod, quas esse eius ad. Labore nihil necessitatibus fuga impedit unde esse, nisi molestias ex? Ad porro sequi saepe ab!",

    time: 12,
    textCount: 0,
    dot: 1,
  },
  {
    avatar: "/images/user/user-04.png",
    name: "Jhon Doe",
    text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repudiandae, temporibus.",
    body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dolores incidunt veritatis consequuntur iusto impedit, ipsam facilis aliquam expedita temporibus quod, quas esse eius ad. Labore nihil necessitatibus fuga impedit unde esse, nisi molestias ex? Ad porro sequi saepe ab!",
    time: 32,
    textCount: 0,
    dot: 3,
  },
  {
    avatar: "/images/user/user-05.png",
    name: "Jane Doe",
    text: "Great",
    body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dolores incidunt veritatis consequuntur iusto impedit, ipsam facilis aliquam expedita temporibus quod, quas esse eius ad. Labore nihil necessitatibus fuga impedit unde esse, nisi molestias ex? Ad porro sequi saepe ab!",
    time: 32,
    textCount: 2,
    dot: 6,
  },
  {
    avatar: "/images/user/user-01.png",
    name: "Jhon Doe",
    text: "How are you?",
    body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dolores incidunt veritatis consequuntur iusto impedit, ipsam facilis aliquam expedita temporibus quod, quas esse eius ad. Labore nihil necessitatibus fuga impedit unde esse, nisi molestias ex? Ad porro sequi saepe ab!",

    time: 32,
    textCount: 0,
    dot: 3,
  },
  {
    avatar: "/images/user/user-03.png",
    name: "Jhon Doe",
    text: "How are you?",
    body: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dolores incidunt veritatis consequuntur iusto impedit, ipsam facilis aliquam expedita temporibus quod, quas esse eius ad. Labore nihil necessitatibus fuga impedit unde esse, nisi molestias ex? Ad porro sequi saepe ab!",
    time: 32,
    textCount: 3,
    dot: 6,
  },
];

const Inbox = () => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Inbox
      </h4>

      <div>
        {chatData.map((chat, key) => (
          <Link
            href={{
              pathname: "/emails/read",
              query: {
                avatar: chat.avatar,
                name: chat.name,
                body: chat.body,
                time: chat.time,
              },
            }}
            className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
            key={key}
          >
            <div className="relative h-14 w-14 rounded-full">
              <Image
                width={56}
                height={56}
                src={chat.avatar}
                alt="User"
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  chat.dot === 6 ? "bg-meta-6" : `bg-meta-${chat.dot}`
                } `}
              ></span>
            </div>

            <div className="flex flex-1 items-center justify-between">
              <div>
                <h5 className="font-medium text-black dark:text-white">
                  {chat.name}
                </h5>
                <p>
                  <span className="text-sm text-black dark:text-white">
                    {chat.text}
                  </span>
                  <span className="text-xs"> . {chat.time} min</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Inbox;
