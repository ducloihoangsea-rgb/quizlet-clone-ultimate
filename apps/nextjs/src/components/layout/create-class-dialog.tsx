"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2 } from "lucide-react";
import { useForm } from "@acme/ui/form";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { toast } from "@acme/ui/toast";
import { CreateClassSchema } from "@acme/validators";

import { api } from "~/trpc/react";
import { useClassDialogContext } from "~/contexts/class-dialog-context";

const countries = [
  { value: "vn", label: "Việt Nam" },
  { value: "us", label: "Hoa Kỳ" },
  { value: "gb", label: "Vương Quốc Anh" },
  { value: "ca", label: "Canada" },
];

const usStates = [
  { value: "al", label: "Alabama" },
  { value: "ca", label: "California" },
  { value: "ny", label: "New York" },
  { value: "tx", label: "Texas" },
  { value: "wa", label: "Washington" },
];

const CreateClassDialog = () => {
  const router = useRouter();
  const [{ open }, dispatch] = useClassDialogContext();
  const utils = api.useUtils();

  const form = useForm({
    schema: CreateClassSchema,
    defaultValues: {
      name: "",
      schoolName: "",
      cityName: "",
      countryName: "Việt Nam",
    },
  });

  const nameVal = form.watch("name");
  const schoolVal = form.watch("schoolName");
  
  // Custom states for steps and select fields
  const [showStep2, setShowStep2] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("vn");
  const [selectedState, setSelectedState] = useState("");

  // Auto trigger Step 2 when Name and School Name are typed
  useEffect(() => {
    if (nameVal.trim().length > 0 && schoolVal.trim().length > 0) {
      setShowStep2(true);
    } else {
      setShowStep2(false);
    }
  }, [nameVal, schoolVal]);

  const { mutate, isPending } = api.class.create.useMutation({
    async onSuccess(data) {
      await utils.class.invalidate();
      toast.success("Đã tạo lớp học thành công!");
      form.reset({
        name: "",
        schoolName: "",
        cityName: "",
        countryName: "Việt Nam",
      });
      setShowStep2(false);
      dispatch({ type: "close" });
      router.push(`/classes/${data.id}`);
    },
    onError() {
      toast.error("Không thể tạo lớp học, vui lòng thử lại.");
    },
  });

  const onSubmit = (values: {
    name: string;
    schoolName: string;
    cityName: string;
    countryName: string;
  }) => {
    mutate(values);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      dispatch({ type: "close" });
    }
  };

  const isFormValid = 
    nameVal.trim().length > 0 && 
    schoolVal.trim().length > 0 && 
    form.watch("cityName").trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl select-none p-8 rounded-3xl">
        <DialogHeader className="items-center text-center space-y-4">
          {/* Logo Icon */}
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-950/40 text-blue-600 rounded-full flex items-center justify-center relative">
            <Users size={32} />
            <div className="absolute top-4 right-4 h-4 w-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
              +
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            Tạo lớp học miễn phí của bạn
          </DialogTitle>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Trao cho học sinh quyền truy cập không gián đoạn vào chế độ Học và Kiểm tra đối với tất cả nội dung trong lớp của bạn. Hoàn toàn miễn phí!
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Step 1 Fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Tên lớp</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Lớp học mới của bạn"
                      className="h-12 border px-4 rounded-xl text-base focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Tên trường</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Tên trường"
                      className="h-12 border px-4 rounded-xl text-base focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Step 2 Fields (Revealed automatically) */}
            {showStep2 && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <FormField
                  control={form.control}
                  name="cityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Tên thành phố</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Tên thành phố"
                          className="h-12 border px-4 rounded-xl text-base focus-visible:ring-1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Select Country Field */}
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Quốc gia</FormLabel>
                    <select
                      className="w-full h-12 bg-background border px-3 rounded-xl text-sm font-medium focus:ring-1 focus:outline-none"
                      value={selectedCountry}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCountry(val);
                        const cName = countries.find((c) => c.value === val)?.label ?? "Việt Nam";
                        form.setValue("countryName", cName);
                      }}
                      disabled={isPending}
                    >
                      {countries.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </FormItem>

                  {/* Select US State (Only shown if US selected) */}
                  {selectedCountry === "us" ? (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Tiểu bang Hoa Kỳ</FormLabel>
                      <select
                        className="w-full h-12 bg-background border px-3 rounded-xl text-sm font-medium focus:ring-1 focus:outline-none"
                        value={selectedState}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedState(val);
                          const stLabel = usStates.find((s) => s.value === val)?.label ?? "";
                          form.setValue("countryName", `Hoa Kỳ (${stLabel})`);
                        }}
                        disabled={isPending}
                      >
                        <option value="">Chọn</option>
                        {usStates.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </FormItem>
                  ) : (
                    // Display general text details or placeholder helper link
                    <div className="flex flex-col justify-end pb-3 pl-1">
                      <button type="button" className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold text-left">
                        Chọn trường từ danh sách
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isPending}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-5 text-sm h-auto transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo lớp"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassDialog;
