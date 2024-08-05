import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  CustomButton,
  JobCard,
  JobTypes,
  Loading,
  TextInput,
} from "../components";
import { apiRequest } from "../utils";

const UploadJob = () => {
  const { user } = useSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const [errMsg, setErrMsg] = useState("");
  const [jobType, setJobType] = useState("Full-Time");
  const [isLoading, setIsLoading] = useState(false);
  const [recentPost, setRecentPost] = useState([]);

  const onSubmit = async (data) => {
    console.log(data);

    console.log(user?.profileUrl);
    if (
      !user?.profileUrl ||
      !user?.about ||
      !user?.contact ||
      !user?.location
    ) {
      setErrMsg("Company profile not set. Please set compnay profile first.");
      return;
    }

    setIsLoading(true);
    setErrMsg(null);

    const newData = { ...data, jobType: jobType };
    try {
      const res = await apiRequest({
        url: "/jobs/upload-job",
        token: user?.token,
        data: newData,
        method: "POST",
      });

      if (res.status === "failed") {
        setErrMsg(res.message);
      } else {
        setErrMsg(res.message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getRecentPost = async () => {
    try {
      const id = user?._id;

      const res = await apiRequest({
        url: "/companies/get-company/" + id,
        method: "GET",
      });

      setRecentPost(res?.data?.jobPosts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRecentPost();
  }, []);

  return (
    <div className='container mx-auto flex flex-col md:flex-row gap-8 2xl:gap-14 bg-[#f7fdfd] px-5'>
      <div className='w-full h-fit md:w-2/3 2xl:2/4 bg-white px-5 py-10 md:px-10 shadow-md'>
        <div>
          <p className='text-gray-500 font-semibold text-2xl'>Vaccines</p>

          <form
            className='w-full mt-2 flex flex-col gap-8'
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextInput
              name='vaccineName'
              label='Vaccine Name'
              placeholder='eg. Live Stock'
              type='text'
              required={true}
              register={register("vaccineName", {
                required: "Vaccine Name is required",
              })}
              error={errors.jobTitle ? errors.jobTitle?.message : ""}
            />

            <div className='w-full flex gap-4'>
              <div className={`w-1/2 mt-2`}>
                <label className='text-gray-600 text-sm mb-1'>Job Type</label>
                <JobTypes jobTitle={jobType} setJobTitle={setJobType} />
              </div>

              <div className='w-1/2'>
                <TextInput
                  name='cost'
                  label='Cost (USD)'
                  placeholder='eg. 1500'
                  type='number'
                  register={register("cost", {
                    required: "Cost is required",
                  })}
                  error={errors.salary ? errors.salary?.message : ""}
                />
              </div>
            </div>

            <div className='w-full flex gap-4'>
              <div className='w-1/2'>
                <TextInput
                  name='units'
                  label='Units Available'
                  placeholder='units'
                  type='number'
                  register={register("units", {
                    required: "Units is required!",
                  })}
                  error={errors.vacancies ? errors.vacancies?.message : ""}
                />
              </div>

              <div className='w-1/2'>
                <TextInput
                  name='Age'
                  label='Suitable Years'
                  placeholder='age'
                  type='number'
                  register={register("age", {
                    required: "Age is required",
                  })}
                  error={errors.experience ? errors.experience?.message : ""}
                />
              </div>
            </div>

            <TextInput
              name='location'
              label='Location'
              placeholder='eg. VanderbijlPark'
              type='text'
              register={register("location", {
                required: "Location is required",
              })}
              error={errors.location ? errors.location?.message : ""}
            />
            <div className='flex flex-col'>
              <label className='text-gray-600 text-sm mb-1'>
                Vaccine Description
              </label>
              <textarea
                className='rounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2 resize-none'
                rows={4}
                cols={6}
                {...register("desc", {
                  required: "Vaccine Description is required!",
                })}
                aria-invalid={errors.desc ? "true" : "false"}
              ></textarea>
              {errors.desc && (
                <span role='alert' className='text-xs text-red-500 mt-0.5'>
                  {errors.desc?.message}
                </span>
              )}
            </div>

            <div className='flex flex-col'>
              <label className='text-gray-600 text-sm mb-1'>Suitability</label>
              <textarea
                className='rounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2 resize-none'
                rows={4}
                cols={6}
                {...register("requirements")}
              ></textarea>
            </div>

            {errMsg && (
              <span role='alert' className='text-sm text-red-500 mt-0.5'>
                {errMsg}
              </span>
            )}
            <div className='mt-2'>
              {isLoading ? (
                <Loading />
              ) : (
                <CustomButton
                  type='submit'
                  containerStyles='inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-8 py-2 text-sm font-medium text-white hover:bg-[#1d4fd846] hover:text-[#1d4fd8] focus:outline-none '
                  title='Sumbit'
                />
              )}
            </div>
          </form>
        </div>
      </div>
      <div className='w-full md:w-1/3 2xl:2/4 p-5 mt-20 md:mt-0'>
        <p className='text-gray-500 font-semibold'>Recent Vaccines</p>

        <div className='w-full flex flex-wrap gap-6'>
          {recentPost.slice(0, 4).map((job, index) => {
            const data = {
              name: user?.name,
              email: user?.email,
              logo: user?.profileUrl,
              ...job,
            };
            return <JobCard job={data} key={index} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default UploadJob;
