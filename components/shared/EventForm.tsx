"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { eventFormSchema } from "@/lib/validator";
import * as z from "zod";
import { eventDefaultValues } from "@/constants";
import Dropdown from "./Dropdown";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "./FileUploader";
import { useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import { useUploadThing } from "@/lib/uploadthing";

import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions/event.actions";
import { IEvent } from "@/lib/database/models/event.model";
import { useUser } from "@clerk/nextjs";

type EventFormProps = {
  type: "Create" | "Update";
  event?: IEvent;
  eventId?: string;
};

// {
//   "event": {
//       "title": "Childhood trauma – ‘Why was my world invisible in sight of professionals?’",
//       "description": "Childhood trauma – ‘Why was my world invisible in full sight of professionals?’\n\nThis session will be led by Jenny Molloy, in partnership with Community Care Inform. She will share deep insight into what it felt, smelt, sounded and looked like to her as a child living in an unpredictable home and experiencing neglect, parental addiction and domestic abuse, resulting in complex trauma that has lasted long into adulthood. Jenny’s experience makes her passionate about the difference good social work can make. She will share powerful learning on the missed opportunities when she was young and how professionals can intervene to support children now.\n\nHearing directly from people with lived experience of social care is one of the most powerful and effective ways to learn and reflect on social work practice. Community Care Inform is committed to providing this type of learning wherever possible, and to supporting people with experiences of social work as children, adults and parents to share their stories with a social work audience in ways that feel safe and comfortable for them.\n\nPresenters:\n\nJenny Molloy, Author, expert contributor, motivational speaker and care leaver (lived experience of social work) \nJessica Chapman, Head of content, Community Care Inform ",
//       "location": "Google Meet",
//       "imageUrl": "https://utfs.io/f/a1a8382f-3ff3-433e-97af-682cb6201959-g9txix.evbuc.com_images_953344273_435164220722_1_original.avif",
//       "startDateTime": "$D2025-03-04T16:44:19.125Z",
//       "endDateTime": "$D2025-03-04T16:44:19.125Z",
//       "categoryId": "67c72c0b648f2af807c6bf33",
//       "price": "",
//       "isFree": true,
//       "url": "https://www.eventbrite.com/e/childhood-trauma-why-was-my-world-invisible-in-sight-of-professionals-tickets-1236070673659?aff=ebdssbcitybrowse&keep_tld=1"
//   },
//   "userId": "$undefined",
//   "path": "/profile"
// }

const EventForm = ({ type, event, eventId }: EventFormProps) => {
  const { user } = useUser();
  const userId = user?.publicMetadata?.userId as string;
  const [files, setFiles] = useState<File[]>([]);

  const initialValues =
    event && type === "Update"
      ? {
          ...event,
          startDateTime: new Date(event.startDateTime),
          endDateTime: new Date(event.endDateTime),
        }
      : eventDefaultValues;
  const router = useRouter();

  const { startUpload } = useUploadThing("imageUploader");

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    let uploadedImageUrl = values.imageUrl;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);

      if (!uploadedImages) {
        return;
      }

      uploadedImageUrl = uploadedImages[0].url;
    }

    if (type === "Create") {
      try {
        const newEvent = await createEvent({
          event: { ...values, imageUrl: uploadedImageUrl },
          userId,
          path: "/profile",
        });

        if (newEvent) {
          form.reset();
          router.push(`/events/${newEvent._id}`);
        }
      } catch (error) {
        console.log("create error here", error);
      }
    }

    if (type === "Update") {
      if (!eventId) {
        router.back();
        return;
      }

      try {
        const updatedEvent = await updateEvent({
          userId,
          event: {
            ...values,
            imageUrl: uploadedImageUrl || "",
            _id: eventId,
          },
          path: `/events/${eventId}`,
        });

        if (updatedEvent) {
          form.reset();
          router.push(`/events/${updatedEvent._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  // const press = async () => {
  //   await createEvent({
  //     event: {
  //       title:
  //         "Childhood trauma – ‘Why was my world invisible in sight of professionals?’",
  //       description:
  //         "Childhood trauma – ‘Why was my world invisible in full sight of professionals?’\n\nThis session will be led by Jenny Molloy, in partnership with Community Care Inform. She will share deep insight into what it felt, smelt, sounded and looked like to her as a child living in an unpredictable home and experiencing neglect, parental addiction and domestic abuse, resulting in complex trauma that has lasted long into adulthood. Jenny’s experience makes her passionate about the difference good social work can make. She will share powerful learning on the missed opportunities when she was young and how professionals can intervene to support children now.\n\nHearing directly from people with lived experience of social care is one of the most powerful and effective ways to learn and reflect on social work practice. Community Care Inform is committed to providing this type of learning wherever possible, and to supporting people with experiences of social work as children, adults and parents to share their stories with a social work audience in ways that feel safe and comfortable for them.\n\nPresenters:\n\nJenny Molloy, Author, expert contributor, motivational speaker and care leaver (lived experience of social work) \nJessica Chapman, Head of content, Community Care Inform ",
  //       location: "Google Meet",
  //       imageUrl:
  //         "https://utfs.io/f/a1a8382f-3ff3-433e-97af-682cb6201959-g9txix.evbuc.com_images_953344273_435164220722_1_original.avif",
  //       startDateTime: "2025-03-21T10:07:25.155Z",
  //       endDateTime: "2027-03-25T10:07:25.155Z",
  //       categoryId: "67c72c0b648f2af807c6bf33",
  //       price: "100",
  //       isFree: false,
  //       url: "https://www.eventbrite.com/e/childhood-trauma-why-was-my-world-invisible-in-sight-of-professionals-tickets-1236070673659?aff=ebdssbcitybrowse&keep_tld=1",
  //     },
  //     userId: "67dd343221c98f8e37e0d502",
  //     path: "/profile",
  //   });
  // };

  return (
    <>
      {/* <button onClick={press}>Press</button> */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Event title"
                      {...field}
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Dropdown
                      onChangeHandler={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <Textarea
                      placeholder="Description"
                      {...field}
                      className="textarea rounded-2xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl className="h-72">
                    <FileUploader
                      onFieldChange={field.onChange}
                      imageUrl={field.value}
                      setFiles={setFiles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/location-grey.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                      />

                      <Input
                        placeholder="Event location or Online"
                        {...field}
                        className="input-field"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">
                        Start Date:
                      </p>
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDateTime"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/calendar.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <p className="ml-3 whitespace-nowrap text-grey-600">
                        End Date:
                      </p>
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        showTimeSelect
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        wrapperClassName="datePicker"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/dollar.svg"
                        alt="dollar"
                        width={24}
                        height={24}
                        className="filter-grey"
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        {...field}
                        className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center">
                                <label
                                  htmlFor="isFree"
                                  className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Free Ticket
                                </label>
                                <Checkbox
                                  onCheckedChange={field.onChange}
                                  checked={field.value}
                                  id="isFree"
                                  className="mr-2 h-5 w-5 border-2 border-primary-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                      <Image
                        src="/assets/icons/link.svg"
                        alt="link"
                        width={24}
                        height={24}
                      />

                      <Input
                        placeholder="URL"
                        {...field}
                        className="input-field"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 w-full"
          >
            {form.formState.isSubmitting ? "Submitting..." : `${type} Event `}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default EventForm;
