import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Filter, Plus, Trash2, Edit, Eye, AlertCircle, FileText, User, Home, MapPin, Phone, Clock, Calendar, CheckCircle2, History, X } from "lucide-react";

// بيانات تجريبية للشكاوى
const complaintsDummyData: Complaint[] = [
  {
    id: "1001",
    date: "2025-01-01",
    customerName: "أحمد الصبياني",
    project: "تل الرمال المالية",
    unitNumber: "",
    source: "الاستبيان",
    status: "تم حلها",
    description: "الشيك محرر للصندوق ولم نتلقى مبلغ الضريبة , تم التواصل مع الصندوق و رد الضريبة للعميل من قبلنا.",
    action: "",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-01-01T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1002",
    date: "2025-02-27",
    customerName: "راشد المحنا",
    project: "19",
    unitNumber: "",
    source: "المقر",
    status: "تم حلها",
    description: "رفع شكوى في 2022 عن تسريب في المكيف تم حلها على حسابه الخاص، أعاد التواصل في 2024 حول عودة المشكلة.",
    action: "تم الانتهاء من العزل وتم اختباره وبانتظار تركيب البلاط بالشقة العلوية ، وفيما يتعلق بشكوى العميل متبقي دهان الاسقف في الشقة وبناء على طلب العميل بأن يكون الموعد للدهان بعد العيد",
    duration: 365,
    createdBy: "عدنان",
    createdAt: "2025-02-27T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1003",
    date: "2025-01-26",
    customerName: "نورة المسفر",
    project: "المعالي",
    unitNumber: "",
    source: "خدمة العملاء",
    status: "تم حلها",
    description: "تم إصلاح مشكلة الألمنيوم بسد الفجوات بالسيلكون والربل.",
    action: "",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-01-26T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1004",
    date: "2025-01-28",
    customerName: "حمد الحسين",
    project: "النخيل",
    unitNumber: "فيلا 10",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "تم الضغط عليه من مهندس الجودة لقبول التسليم، بعد التسليم ظهر له بعض المشاكل،البوية،التشققات في الجدران، إطارات الأبواب.",
    action: "آخر تحديث 25 مارس، باقي له فقط الخشب.",
    duration: 60,
    createdBy: "عدنان",
    createdAt: "2025-01-28T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1005",
    date: "2025-02-17",
    customerName: "تركي السعيد",
    project: "المعالي",
    unitNumber: "و 26 / ع 26",
    source: "الاستبيان",
    status: "تم حلها",
    description: "التـاخر في التسليم بسبب عدم حل الإصلاحات لدى العميل متبقى مشكلة ميلان البلاط.",
    action: "تم التحديث من قبل المهندس سعود موصلي بأنتهاء جميع الاصلاحات، تم التواصل مع العميل وافاد بانه لم يتم اصلاح الميلان للان، تم التواصل مع سعود 25 مارس، وذكر بأن العميل تم اصلاح جميع مشاكله وتم الاتفاق ان التسليم 12 بالليل ولم يلتزم العميل، تم تحديد موعد جديد 25 مارس مساءً، تم التسليم في 26 مارس.",
    duration: 37,
    createdBy: "عدنان",
    createdAt: "2025-02-17T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1006",
    date: "2025-01-15",
    customerName: "إيمان السيهاتي",
    project: "",
    unitNumber: "",
    source: "المقر",
    status: "تم حلها",
    description: "مشكلة في رهن الصكوك / تم إبلاغ العميلة بمقدرتها بسحب مبلغ العربون او الانتظار وفي متابعة منع قسم المبيعات",
    action: "",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-01-15T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1007",
    date: "2025-02-16",
    customerName: "عبدالغني الحمدي",
    project: "41",
    unitNumber: "و4 / ع3",
    source: "الاستبيان",
    status: "لم يتم حلها",
    description: "مشكلة تسريب من الجار بالإعلى وتم تحديد موعد فحص صيانة لمعرفة سبب التسريب من الشقه العلوية",
    action: "تم الغاء الطلب من قبل الصيانة بسبب أن العميل يريد الغاء جرجور المطر وربطه علي خط الصرف وهذا يتنافي مع تعليمات البلديه بعدم ربط جرجور الامطار مع الصرف، تم التواصل مع العميل وذكر بأن الصيانة لم يعطونه حل وكلام الصيانة غير صحيح بأن المسألة سيتم تسويتها بينه وبين جاره، تمت مخاطبة الصيانة وذكروا انه لا يوجد حل الا الربط مع الصرف والذي لا يمكن ان يتم الا بموافقة البلدية، تم التواصل مع العميل وابلاغه بذلك 25 مارس.",
    duration: 38,
    createdBy: "عدنان",
    createdAt: "2025-02-16T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1008",
    date: "2025-01-19",
    customerName: "سعد الهويش",
    project: "",
    unitNumber: "",
    source: "خدمة العملاء",
    status: "تم حلها",
    description: "تضرر اجزاء من المنزل بسبب اعمال الرمز المجاورة له وتم التواصل معه لتعويضه وبأنتظار الرد من العميل",
    action: "تم رفض مبلغ التعويض من العميل مطالبا بمبلغ اعلى من ما طرح عليه",
    duration: 65,
    createdBy: "عدنان",
    createdAt: "2025-01-19T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1009",
    date: "2025-02-19",
    customerName: "عمر المبرزي",
    project: "النخيل",
    unitNumber: "فيلا 12",
    source: "المقر",
    status: "لازالت قائمة",
    description: "شكوى بوجود اسمنت في المواصير وانتفاخات بالبويه",
    action: "بأنتظار رد العميل للاتفاق على محضر التصليح، العميل ذكر للصيانة بأن موعد الاصلاحات المناسب له بعد العيد.",
    duration: 35,
    createdBy: "عدنان",
    createdAt: "2025-02-19T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1010",
    date: "2025-03-06",
    customerName: "عبدالرحمن العيسى",
    project: "تل الرمال",
    unitNumber: "",
    source: "خدمة العملاء",
    status: "تم حلها",
    description: "تجمع مائي في دورة المياة ،تأخر وصول الصيانه أدى إلى تفاقم المشكله.",
    action: "تم التواصل معه من قبل فريق الصيانة وتم حل المشكلةفي نفس اليوم.",
    duration: 1,
    createdBy: "عدنان",
    createdAt: "2025-03-06T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1021",
    date: "2025-02-25",
    customerName: "ابراهيم",
    project: "ستون كومبليكس",
    unitNumber: "",
    source: "خدمة العملاء",
    status: "تم حلها",
    description: "شكوى من العملاء المجاورين للعميل ابراهيم بسبب ازاله البلاط في الحمام",
    action: "حضور شركة مختصة لمعالجة المشكلة وسيتم إجراء اختبار لضمان عدم وجود تسريبات خلال 15 يومًا من تاريخ الإصلاح 7/3/2025",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-02-25T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1022",
    date: "2025-03-13",
    customerName: "مشعل العنزي",
    project: "تل الرمال المالية",
    unitNumber: "",
    source: "خدمة العملاء",
    status: "تم حلها",
    description: "تأخر في تلبية طلبه لمحضر الفرز",
    action: "تم التواصل مع الأستاذ مشاري الرويجح وتم تزويدنا بالمحضر.",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-03-13T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1023",
    date: "2025-03-13",
    customerName: "امين العلقم",
    project: "النخيل",
    unitNumber: "فيلا 6",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "لديه مشكلة في ماسورة التصريف لمكيف إحدى غرف النوم، التذكرة لها الآن أكثر من 4 أشهر من غير إجابة.",
    action: "تم إرسال إيميل للصيانة بكامل تفاصيل الشكوى،بانتظار تجاوبهم، تم طلب مستجدات من الصيانة 24 مارس بلا رد، جاء الرد 25 مارس طلب إجراء الاصلاحات بعد العيد.",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-03-13T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1024",
    date: "2025-02-14",
    customerName: "عبدالرحمن الشيمي",
    project: "45",
    unitNumber: "-",
    source: "الاستبيان",
    status: "لازالت قائمة",
    description: "تأخر فى الإفراغ رغم سداد كامل ثمن الوحده من ٤ شهور ومشكله فى شبكه الجوال داخل المبنى وعدم استجابه الصيانه لمشاكل ما بعد الاستلام للوحده.",
    action: "تم التواصل مع العميل والصيانة، التأخير كان من الطرفين كلاهما، العميل حول من حساب شركته من ثم رفض الطلب من وزارة العدل وأخذت المسألة وقت لإسترجاع المبلغ ثم تقديم شيك مصدق من حسابه الشخصي، وأحد الوثائق المطلوبة للإفراغ من وزارة العدل كانت خاطئة فإضطر يكلم صندوق الرمز لتعديلها ولم يتجاوبوا معه في الوقت المطلوب، والآن تم تعديل كل شي فقط انتهى طلب التملك للعميل من وزارة الداخلية ويحتاج تجديده للإنتهاء من الإفراغ، تم التجديد وتم التواصل مع عبدالله العمري وتم رفع الطلب مرة أخرى، ، تم رفضه 26 مارس وتم التواصل مع عبدالله العمري للدعم.",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-02-14T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1025",
    date: "2025-03-20",
    customerName: "امل عبداللة الغامدي",
    project: "تل الرمال",
    unitNumber: "و 7 / ع A7",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "العميلة تشكي من مشكلة تسريب في سقف دورة المياة مع مشكلة في تمديدات التكييف، تذكر العميلة زيارة للصيانة لها ذكرو فيها ان المشكلة من الجار العلوي، ولا تعلم الى الآن هل تواصلوا معه للإصلاح وانتهاء شكواها أم لا لاسيما أن مسؤولي الصيانة الذين حضروا لها لايردون على استفساراتها.",
    action: "",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-03-20T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1026",
    date: "2025-03-20",
    customerName: "سعد وصل الاحمدي",
    project: "المعالي",
    unitNumber: "و 10",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "انسداد مجرى المياة ف البلكونه بالغرفة الرئيسية وتجمع كمية من المياة تسريبات ب سقف الصاله، تواصل مع مهندس الجودة ولم تحل، تواصل مع ابوبكر من فريق الصيانة بلا حل، رقم التذكرة 2933.",
    action: "",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-03-20T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1027",
    date: "2025-03-22",
    customerName: "عبدالعزيز المنصور",
    project: "41",
    unitNumber: "و5 / ع7",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "العميل مستاء من التسريبات التي تحدث بعد الامطار، العميل افاد انه تمت معالجة الاسقف قبل سنة لنفس المشكلة والان عادت من جديد ، رفع طلب بالرقم 2984، تم الغاءه من الصيانة بعد ساعة دون توضيح.",
    action: "",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-03-22T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1028",
    date: "2025-03-23",
    customerName: "عبدالاله العرف",
    project: "نَقْش فيلا",
    unitNumber: "و 2",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "عميل مستاء جداً من عدم إكتمال الصيانة لوحدتة من وقت التسليم كما أنه أشتكى من سوء معاملة المهندس أبوبكر معه.",
    action: "",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-03-23T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1029",
    date: "2025-03-24",
    customerName: "سعود الحماد",
    project: "تل الرمال",
    unitNumber: "و1 / ع 4A",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "الشخص اللي يتواصل معه بشأن طلبات الصيانة عبدالرؤوف، المشاكل اللي كان يواجهها كانت الترويبه، تصدعات داخل وخارج الشقة ، مشكلة في قياسات شبك الالمنيوم، في رمضان العام الماضي جاء شخص يمني مع عبدالرؤوف لأخذ القياسات ووعدوه بإتمام الإصلاحات بعد العيد، تواصلوا معه بعد عيد الأضحى أخذوا منه الشبك وإلى الآن لم يتم إرجاعه ولم يتم حل الطلبات المذكورة.",
    action: "تم التواصل مع العميل وأخذ كافة التفاصيل، تم تزويد الصيانة بها 24 مارس، تم التواصل مع العميل 25 مارس وابلاغه برفع طلب يتضمن كافة التفاصيل التي يملكها مع صور للأمور المطلوبة صيانتها في أتار لمتابعتها مع فريق الصيانة.",
    duration: 0,
    createdBy: "عدنان",
    createdAt: "2025-03-24T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1030",
    date: "2025-03-24",
    customerName: "يحيى الذكير",
    project: "النخيل",
    unitNumber: "و3 / ع7",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "تم الضغط على العميل من قبل الجودة للاستلام، الوحدة فيها تصدعات في الجدران وكانت تحتاج إلى دهان للسقف، مشكلة التصدعات ذكرو له انها مشكلة دهان فقط وتم الدهان ولا زالت التصدعات موجودة، وعده المسؤول بحل المشاكل بعد قبول التسليم بعد ذلك ظهرة مشاكل في حنفية دورة المياه تهرب وبدأت تتسبب بصدأ للمنطقة التي حولها، الفاصل في دورة المياة مكسور، طلب من الصيانة اكثر من مرة الاصلاح بشكل مباشر بلا حل، للمراجعة يوم26 مارس.",
    action: "تم التواصل مع العميل وسيتم رفع ايميل للصيانة، بانتظار تزويدنا من قبل العميل بالمحادثات مع الصيانة لارفاقها.",
    duration: 0,
    createdBy: "موظف خدمة العملاء",
    createdAt: "2025-03-24T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  },
  {
    id: "1031",
    date: "2025-03-24",
    customerName: "عبدالله العبدالقادر",
    project: "النخيل",
    unitNumber: "و10 / ع 4",
    source: "خدمة العملاء",
    status: "لازالت قائمة",
    description: "تنظيف بقايا الترويبة الموجودة في البلاط رفع العميل طلب وتم إلغاءة من قبل الصيانة وتم الرد عليه بإن البلاط يحتاج فقط تنظيف رقم الطلب: 1591، العميل رفع طلب بخصوص الخدوش الموجودة في زجاجة البلكونة وتم إنشاء الطلب من تاريخ 14/12/2024 ولم تتم معالجة الطلب ولا التواصل مع العميل مرفق لكم صورة الطلب أعلاه حتى الأن رقم الطلب 1592",
    action: "تم تزويد الصيانة بكافة التفاصيل، جاء رد الصيانة 25 مارس أن المشكلة فقط تحتاج تنظيف للارضية فقط في ما يتعلق بالترويبة، أما الزجاج فقط أبلغت الصيانة أن المسألة لا تتعدا كونها سوء استخدام، الصيانة لم تبلغ العميل بالمستجدات ولازال الطلب 1592 للزجاج مفتوحًا.",
    duration: 0,
    createdBy: "موظف خدمة العملاء",
    createdAt: "2025-03-24T10:00:00",
    updatedBy: null,
    updatedAt: null,
    updates: []
  }
];

// حالات الشكاوى
const complaintStatuses = [
  { value: "all", label: "جميع الحالات" },
  { value: "تم حلها", label: "تم حلها" },
  { value: "لازالت قائمة", label: "لازالت قائمة" },
  { value: "لم يتم حلها", label: "لم يتم حلها" }
];

// مصادر الشكاوى
const complaintSources = [
  { value: "phone", label: "مكالمة هاتفية" },
  { value: "email", label: "البريد الإلكتروني" },
  { value: "visit", label: "زيارة شخصية" },
  { value: "social_media", label: "وسائل التواصل الاجتماعي" },
  { value: "website", label: "الموقع الإلكتروني" },
  { value: "other", label: "أخرى" }
];


// تعديل واجهة الشكوى لتشمل تتبع التغييرات
interface ComplaintUpdate {
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedAt: string;
}

interface Complaint {
  id: string;
  date: string;
  customerName: string;
  project: string;
  unitNumber: string;
  source: string;
  status: string;
  description: string;
  action: string;
  duration: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  updates: ComplaintUpdate[];
}

export default function Complaints() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const savedComplaints = localStorage.getItem('complaints');
    return savedComplaints ? JSON.parse(savedComplaints) : complaintsDummyData;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [newComplaint, setNewComplaint] = useState<Omit<Complaint, "id" | "createdBy" | "duration" | "createdAt" | "updatedBy" | "updatedAt" | "updates">>({
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    project: "",
    unitNumber: "",
    source: "",
    status: "جديدة",
    description: "",
    action: ""
  });

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.customerName.includes(searchTerm) || 
      complaint.project.includes(searchTerm) || 
      complaint.description.includes(searchTerm) ||
      complaint.id.includes(searchTerm);

    const matchesStatus = selectedStatus === "all" || complaint.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleNewComplaintChange = (field: string, value: string) => {
    setNewComplaint((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const handleEditSetup = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewComplaint({
      date: complaint.date,
      customerName: complaint.customerName,
      project: complaint.project,
      unitNumber: complaint.unitNumber,
      source: complaint.source,
      status: complaint.status,
      description: complaint.description,
      action: complaint.action
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSetup = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDeleteDialogOpen(true);
  };

  const handleAddComplaint = async () => {
    const newId = (1000 + complaints.length + 1).toString();
    const now = new Date().toISOString();

    const complaint: Complaint = {
      ...newComplaint,
      id: newId,
      createdBy: user?.username || "مستخدم النظام",
      duration: 0,
      createdAt: now,
      updatedBy: null,
      updatedAt: null,
      updates: []
    };

    const updatedComplaints = [complaint, ...complaints];
    setComplaints(updatedComplaints);
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));

    // Send email notification
    try {
      const { success } = await sendComplaintEmail({
        type: 'new',
        complaint: {
          id: complaint.id,
          customerName: complaint.customerName,
          status: complaint.status,
          description: complaint.description,
          project: complaint.project,
          unitNumber: complaint.unitNumber
        }
      });

      if (success) {
        addNotification({
          title: "تمت الإضافة",
          message: `تم إضافة الشكوى رقم ${newId} بنجاح وإرسال الإشعارات`,
          type: "success"
        });
      } else {
        addNotification({
          title: "تمت الإضافة",
          message: `تم إضافة الشكوى رقم ${newId} بنجاح ولكن فشل إرسال الإشعارات`,
          type: "warning"
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      addNotification({
        title: "تمت الإضافة",
        message: `تم إضافة الشكوى رقم ${newId} بنجاح ولكن فشل إرسال الإشعارات`,
        type: "warning"
      });
    }

    setIsAddDialogOpen(false);

    setNewComplaint({
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      project: "",
      unitNumber: "",
      source: "",
      status: "جديدة",
      description: "",
      action: ""
    });
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || !user) return;

    const now = new Date().toISOString();
    const updates: ComplaintUpdate[] = [];

    // تتبع التغييرات في كل الحقول
    const fieldsToCheck = {
      customerName: 'اسم العميل',
      project: 'المشروع',
      unitNumber: 'رقم الوحدة',
      source: 'مصدر الشكوى',
      status: 'الحالة',
      description: 'تفاصيل الشكوى',
      action: 'الإجراء المتخذ'
    };

    Object.entries(fieldsToCheck).forEach(([field, label]) => {
      if (selectedComplaint[field] !== newComplaint[field]) {
        updates.push({
          field,
          oldValue: selectedComplaint[field] || '',
          newValue: newComplaint[field] || '',
          updatedBy: user.username,
          updatedAt: now
        });
      }
    });

    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === selectedComplaint.id) {
        return {
          ...complaint,
          ...newComplaint,
          updatedBy: user.username,
          updatedAt: now,
          updates: [...complaint.updates, ...updates]
        };
      }
      return complaint;
    });

    setComplaints(updatedComplaints);
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    setIsEditDialogOpen(false);

    // Send email notification for update
    try {
      const { success } = await sendComplaintEmail({
        type: 'update',
        complaint: {
          id: selectedComplaint.id,
          customerName: newComplaint.customerName,
          status: newComplaint.status,
          description: newComplaint.description,
          project: newComplaint.project,
          unitNumber: newComplaint.unitNumber,
          updatedBy: user.username
        }
      });

      // إظهار إشعار لكل تحديث
      updates.forEach(update => {
        addNotification({
          title: "تم التحديث",
          message: `تم تحديث ${fieldsToCheck[update.field]} من "${update.oldValue}" إلى "${update.newValue}" بواسطة ${user.username}`,
          type: "success"
        });
      });

      if (!success) {
        addNotification({
          title: "تنبيه",
          message: "تم حفظ التحديثات ولكن فشل إرسال الإشعارات",
          type: "warning"
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      addNotification({
        title: "تنبيه",
        message: "تم حفظ التحديثات ولكن فشل إرسال الإشعارات",
        type: "warning"
      });
    }
  };

  const handleDeleteComplaint = () => {
    if (!selectedComplaint) return;

    const filteredComplaints = complaints.filter(
      complaint => complaint.id !== selectedComplaint.id
    );

    setComplaints(filteredComplaints);
    localStorage.setItem('complaints', JSON.stringify(filteredComplaints));
    setIsDeleteDialogOpen(false);

    addNotification({
      title: "تم الحذف",
      message: `تم حذف الشكوى رقم ${selectedComplaint.id} بنجاح`,
      type: "success"
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // دالة مساعدة للحصول على اسم الحقل بالعربية
  const getFieldName = (field: string): string => {
    const fieldNames: { [key: string]: string } = {
      status: 'الحالة',
      action: 'الإجراء المتخذ',
      description: 'تفاصيل الشكوى',
      customerName: 'اسم العميل',
      project: 'المشروع',
      unitNumber: 'رقم الوحدة',
      source: 'مصدر الشكوى'
    };
    return fieldNames[field] || field;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">سجل الشكاوى</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="ml-2 h-4 w-4" />
                إضافة شكوى جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>إضافة شكوى جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الشكوى لإضافتها إلى السجل وتعيين رقم تذكرة جديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newComplaint.date}
                    onChange={(e) => handleNewComplaintChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={newComplaint.customerName}
                    onChange={(e) => handleNewComplaintChange("customerName", e.target.value)}
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">المشروع</Label>
                  <Input
                    id="project"
                    value={newComplaint.project}
                    onChange={(e) => handleNewComplaintChange("project", e.target.value)}
                    placeholder="أدخل اسم المشروع"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitNumber">رقم الوحدة / العمارة</Label>
                  <Input
                    id="unitNumber"
                    value={newComplaint.unitNumber}
                    onChange={(e) => handleNewComplaintChange("unitNumber", e.target.value)}
                    placeholder="أدخل رقم الوحدة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">مصدر الشكوى</Label>
                  <Select
                    value={newComplaint.source}
                    onValueChange={(value) => handleNewComplaintChange("source", value)}>
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مصدر الشكوى" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintSources.map((source) => (
                        <SelectItem key={source.value} value={source.label}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select
                    value={newComplaint.status}
                    onValueChange={(value) => handleNewComplaintChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الشكوى" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.label}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    تفاصيل الشكوى
                  </Label>
                  <div className="relative">
                  <Textarea
                    id="description"
                    value={newComplaint.description}
                    onChange={(e) => handleNewComplaintChange("description", e.target.value)}
                      placeholder="أدخل تفاصيل الشكوى هنا..."
                      className="min-h-[150px] bg-[#1a1c23] border border-gray-800/50 rounded-xl p-4 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-y"
                    required
                  />
                    <div className="absolute bottom-3 left-3 text-xs text-gray-500">
                      يرجى كتابة تفاصيل الشكوى بشكل واضح ودقيق
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="action">الإجراء المتخذ</Label>
                  <Textarea
                    id="action"
                    value={newComplaint.action}
                    onChange={(e) => handleNewComplaintChange("action", e.target.value)}
                    placeholder="أدخل الإجراء المتخذ (إن وجد)"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="button" onClick={handleAddComplaint}>
                  إضافة الشكوى
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل الشكاوى والطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن عميل، مشروع، أو شكوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {complaintStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.label}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم التذكرة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">المشروع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        لا توجد شكاوى متطابقة مع معايير البحث
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-medium">{complaint.id}</TableCell>
                        <TableCell>{complaint.date}</TableCell>
                        <TableCell>{complaint.customerName}</TableCell>
                        <TableCell>{complaint.project}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            complaint.status === "تم حلها" || complaint.status === "تم الحل"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : complaint.status === "لازالت قائمة"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : complaint.status === "لم يتم حلها"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                          }`}>
                            {complaint.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewComplaint(complaint)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditSetup(complaint)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSetup(complaint)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a1c23] to-[#1f2128] border border-gray-800/50 shadow-2xl">
          {selectedComplaint && (
            <>
              <DialogHeader className="border-b border-gray-800/50 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gray-800/50">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <span>تفاصيل الشكوى #{selectedComplaint.id}</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                  تاريخ التسجيل: {formatDate(selectedComplaint.createdAt)}
                </DialogDescription>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    selectedComplaint.status === "تم حلها" || selectedComplaint.status === "مغلقة"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : selectedComplaint.status === "قيد المعالجة"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : selectedComplaint.status === "معلقة"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {selectedComplaint.status}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8">
                {/* معلومات العميل والمشروع */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      معلومات العميل والمشروع
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">اسم العميل</div>
                          <div className="font-medium text-white">{selectedComplaint.customerName}</div>
                        </div>
                </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Home className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">المشروع</div>
                          <div className="font-medium text-white">{selectedComplaint.project}</div>
                        </div>
                </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">رقم الوحدة</div>
                          <div className="font-medium text-white">{selectedComplaint.unitNumber}</div>
                        </div>
                </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Phone className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">مصدر الشكوى</div>
                          <div className="font-medium text-white">{selectedComplaint.source}</div>
                        </div>
                      </div>
                    </div>
                </div>

                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      معلومات الوقت والإنشاء
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <Clock className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">المدة</div>
                          <div className="font-medium text-white">{selectedComplaint.duration} يوم</div>
                  </div>
                </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Calendar className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">تاريخ الإنشاء</div>
                          <div className="font-medium text-white">{formatDate(selectedComplaint.createdAt)}</div>
                        </div>
                </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-teal-500/10">
                          <User className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">تم الإنشاء بواسطة</div>
                          <div className="font-medium text-white">{selectedComplaint.createdBy}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* تفاصيل الشكوى والإجراء */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      تفاصيل الشكوى
                    </h3>
                    <div className="p-4 bg-gray-800/30 rounded-lg min-h-[120px]">
                      <p className="text-white leading-relaxed">{selectedComplaint.description}</p>
                    </div>
                </div>

                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      الإجراء المتخذ
                    </h3>
                    <div className="p-4 bg-gray-800/30 rounded-lg min-h-[120px]">
                      <p className="text-white leading-relaxed">
                        {selectedComplaint.action}
                        {selectedComplaint.duration > 0 && (
                          <span className="block mt-2 text-sm text-gray-400">
                            {selectedComplaint.status === "تم حلها" ? "قديمة" : ""}
                          </span>
                        )}
                      </p>
                  </div>
                </div>
              </div>

                {/* معلومات التحديث */}
                {selectedComplaint.updates && selectedComplaint.updates.length > 0 && (
                  <div className="bg-[#20232b] rounded-xl p-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-4">
                      <History className="w-4 h-4 text-blue-400" />
                      سجل التحديثات
                    </h3>
                    <div className="space-y-4">
                      {selectedComplaint.updates.map((update, index) => (
                        <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-gray-400">{update.updatedBy}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(update.updatedAt).toLocaleString('ar-SA')}
                            </span>
                          </div>
                          <p className="text-sm text-white">
                            تم تحديث {getFieldName(update.field)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-8">
                <Button 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                >
                  إغلاق
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a1c23] to-[#1f2128] border border-gray-800/50 shadow-2xl">
          <DialogHeader className="border-b border-gray-800/50 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gray-800/50">
                    <Edit className="w-5 h-5 text-blue-400" />
                  </div>
                  <span>تعديل الشكوى #{selectedComplaint?.id}</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  قم بتعديل بيانات الشكوى في النموذج أدناه
            </DialogDescription>
              </div>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="p-1 hover:bg-gray-800/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* معلومات العميل والمشروع */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  معلومات العميل والمشروع
                </h3>
                <div className="space-y-4">
            <div className="space-y-2">
                    <Label htmlFor="edit-date" className="text-xs text-gray-400">التاريخ</Label>
                    <div className="relative">
              <Input
                id="edit-date"
                type="date"
                value={newComplaint.date}
                onChange={(e) => handleNewComplaintChange("date", e.target.value)}
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white"
                required
              />
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
            </div>

            <div className="space-y-2">
                    <Label htmlFor="edit-customerName" className="text-xs text-gray-400">اسم العميل</Label>
                    <div className="relative">
              <Input
                id="edit-customerName"
                value={newComplaint.customerName}
                onChange={(e) => handleNewComplaintChange("customerName", e.target.value)}
                placeholder="أدخل اسم العميل"
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white pr-9"
                required
              />
                      <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
            </div>

            <div className="space-y-2">
                    <Label htmlFor="edit-project" className="text-xs text-gray-400">المشروع</Label>
                    <div className="relative">
              <Input
                id="edit-project"
                value={newComplaint.project}
                onChange={(e) => handleNewComplaintChange("project", e.target.value)}
                placeholder="أدخل اسم المشروع"
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white pr-9"
                required
              />
                      <Home className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
            </div>

            <div className="space-y-2">
                    <Label htmlFor="edit-unitNumber" className="text-xs text-gray-400">رقم الوحدة / العمارة</Label>
                    <div className="relative">
              <Input
                id="edit-unitNumber"
                value={newComplaint.unitNumber}
                onChange={(e) => handleNewComplaintChange("unitNumber", e.target.value)}
                placeholder="أدخل رقم الوحدة"
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white pr-9"
                required
              />
                      <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
            </div>

              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  معلومات الشكوى
                </h3>
                <div className="space-y-4">
            <div className="space-y-2">
                    <Label htmlFor="edit-source" className="text-xs text-gray-400">مصدر الشكوى</Label>
              <Select
                value={newComplaint.source}
                onValueChange={(value) => handleNewComplaintChange("source", value)}
              >
                      <SelectTrigger className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white">
                  <SelectValue placeholder="اختر مصدر الشكوى" />
                </SelectTrigger>
                <SelectContent>
                  {complaintSources.map((source) => (
                    <SelectItem key={source.value} value={source.label}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-xs text-gray-400">الحالة</Label>
              <Select
                value={newComplaint.status}
                onValueChange={(value) => handleNewComplaintChange("status", value)}
              >
                      <SelectTrigger className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white">
                  <SelectValue placeholder="اختر حالة الشكوى" />
                </SelectTrigger>
                <SelectContent>
                  {complaintStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.label}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* تفاصيل الشكوى والإجراء */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  تفاصيل الشكوى
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-xs text-gray-400">التفاصيل</Label>
                  <div className="relative">
              <Textarea
                id="edit-description"
                value={newComplaint.description}
                onChange={(e) => handleNewComplaintChange("description", e.target.value)}
                placeholder="أدخل تفاصيل الشكوى"
                      className="min-h-[150px] bg-gray-800/30 border-gray-800/50 rounded-xl p-4 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-y"
                required
              />
                    <div className="absolute bottom-3 left-3 text-xs text-gray-500">
                      يرجى كتابة تفاصيل الشكوى بشكل واضح ودقيق
                    </div>
                  </div>
                </div>
            </div>

              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  الإجراء المتخذ
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="edit-action" className="text-xs text-gray-400">الإجراء</Label>
              <Textarea
                id="edit-action"
                value={newComplaint.action}
                onChange={(e) => handleNewComplaintChange("action", e.target.value)}
                placeholder="أدخل الإجراء المتخذ (إن وجد)"
                    className="min-h-[150px] bg-gray-800/30 border-gray-800/50 rounded-xl p-4 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-y"
              />
            </div>
          </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleUpdateComplaint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الشكوى؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الشكوى رقم {selectedComplaint?.id} نهائيًا. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComplaint} className="bg-red-500 hover:bg-red-600">
              نعم، حذف الشكوى
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}