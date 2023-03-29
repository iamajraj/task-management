import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CloseOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Calendar, DatePicker, message, Upload } from "antd";
import { toast, Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import axiosInstance from "../service/axiosInstance";

const Tasks = () => {
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [settingTask, setSettingTask] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [modalTask, setModalTask] = useState(null);

    const inpRef = useRef();
    const textInpRef = useRef();

    const { id } = useParams();

    const onSet = async () => {
        const value = inpRef.current.value;
        if (!value || !selectedDate) {
            return toast("Date or number can't be empty.", {
                icon: "😐",
            });
        }

        setSettingTask(true);

        try {
            const params = new FormData();
            params.append("date", selectedDate);
            params.append("number", Number(inpRef.current.value));
            params.append("text", textInpRef.current.value);
            params.append("account_id", user._id);
            params.append("image", selectedFile);

            await axiosInstance.post("/accounts/tasks", params);
            await getAccount(user._id);

            setSelectedFile(null);
            inpRef.current.value = "";
            textInpRef.current.value = "";

            message.success("🚀 Task has been added.");
        } catch (err) {
            message.error(
                err?.response?.data?.message ?? "Something went wrong"
            );
        } finally {
            setSettingTask(false);
        }
    };

    const getAccount = async (id, stopLoading = () => {}) => {
        try {
            const res = await axiosInstance.get(`/accounts/${id}`);
            const { account } = res.data;
            setUser(account);
        } catch (err) {
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        if (id) {
            getAccount(id, () => setLoading(false));
        }
    }, [id]);

    const renderDateCell = (value) => {
        let isSame = user.tasks?.find((aten) => {
            const date = dayjs(aten.date);
            if (date.isSame(value.toISOString(), "day")) {
                return true;
            } else {
                return false;
            }
        });
        return (
            <div
                onClick={() => {
                    setModalTask(isSame);
                }}
                className={`w-full h-full flex justify-between relative p-1 gap-2 overflow-hidden ${
                    isSame
                        ? isSame.number > 0
                            ? "border-[3px] border-l-green-500 border-b-green-500"
                            : "border-[3px] border-l-red-500 border-b-red-500"
                        : ""
                }`}
            >
                {isSame?.text && (
                    <p className="text-black text-[14px] flex-1">
                        {isSame.text.length > 30
                            ? isSame.text.slice(0, 30) + "..."
                            : isSame.text}
                    </p>
                )}

                {isSame?.image && (
                    <div className="flex-1 c-shadow -top-5 left-0 bg-white rounded-md">
                        <img
                            src={isSame?.image}
                            className="w-full h-full object-cover rounded-md"
                            alt=""
                        />
                    </div>
                )}
            </div>
        );
    };

    return user ? (
        <div className="py-3">
            <Toaster />
            <div className="flex gap-5 flex-col">
                <h1 className="text-[25px] flex items-center gap-3">
                    <UserOutlined />
                    {user.name}
                </h1>
                <div className="flex flex-col gap-3">
                    <div className="space-x-4">
                        <DatePicker
                            onChange={(value) => {
                                setSelectedDate(value.toISOString());
                            }}
                        />
                        <input
                            ref={inpRef}
                            placeholder="Enter a number"
                            type="number"
                            className="border outline-none py-2 rounded-lg focus:ring-1 focus:ring-blue-500 px-2"
                        />
                    </div>
                    <textarea
                        type="text"
                        className="border max-w-[500px] outline-none py-2 px-2 rounded-lg"
                        ref={textInpRef}
                        placeholder="Enter the text (optional)"
                    />
                    <div className="flex items-start gap-3">
                        <div className="space-x-3">
                            <Upload
                                accept="image/*"
                                beforeUpload={(file) => {
                                    setSelectedFile(file);
                                    return false;
                                }}
                                maxCount={1}
                                fileList={selectedFile ? [selectedFile] : null}
                                onRemove={(file) => {
                                    setSelectedFile(null);
                                }}
                            >
                                <Button icon={<UploadOutlined />}>
                                    Select File (optional)
                                </Button>
                            </Upload>
                        </div>
                        <div className="space-x-2">
                            <Button
                                loading={settingTask}
                                onClick={onSet}
                                type="primary"
                            >
                                Set
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Calendar dateCellRender={renderDateCell} />
            {modalTask && (
                <ModalTask
                    task={modalTask}
                    open={modalTask}
                    setOpen={setModalTask}
                />
            )}
        </div>
    ) : (
        <div className="flex justify-center text-[25px] mt-3">
            {loading ? <h1>Loading...</h1> : <h1>User not found</h1>}
        </div>
    );
};

const ModalTask = ({ task, setOpen }) => {
    return (
        <div className="w-full h-full inset-0 fixed bg-[#00000040] px-[50px] z-[999] flex items-center justify-center">
            <div className="w-full max-w-[500px] h-[500px] bg-white rounded-lg c-shadow p-7 relative overflow-hidden flex flex-col">
                <CloseOutlined
                    className="absolute right-7 text-gray-500 text-[20px] cursor-pointer"
                    onClick={() => setOpen(null)}
                />
                <h1 className="text-[20px] border-b pb-2">Task</h1>
                <div className="my-2"></div>
                {task?.image && (
                    <>
                        <img
                            src={task.image}
                            alt=""
                            className="w-full h-[200px] object-cover"
                        />
                        <div className="my-4 bg-gray-300 h-[1px] w-full"></div>
                    </>
                )}
                {task?.text && (
                    <p className="overflow-y-scroll c-scrollbar">{task.text}</p>
                )}
            </div>
        </div>
    );
};

export default Tasks;
