--
-- PostgreSQL database dump
--

\restrict UhC4oUyrYchVgfbfvevCWrEHPwkyjgFdGQgIIOYxQcW73mCOc5pDq8PfnW4t9yH

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg12+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: denskill_database_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO denskill_database_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.assessments (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    total_marks integer DEFAULT 100,
    weight numeric DEFAULT 1.0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assessments OWNER TO denskill_database_user;

--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessments_id_seq OWNER TO denskill_database_user;

--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- Name: attendance_logs; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.attendance_logs (
    id integer NOT NULL,
    student_id integer,
    course_id character varying(255),
    status character varying(50) DEFAULT 'present'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.attendance_logs OWNER TO denskill_database_user;

--
-- Name: attendance_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.attendance_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_logs_id_seq OWNER TO denskill_database_user;

--
-- Name: attendance_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.attendance_logs_id_seq OWNED BY public.attendance_logs.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    tutor_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.courses OWNER TO denskill_database_user;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO denskill_database_user;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    user_id integer,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    country character varying(100) NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    course character varying(100) NOT NULL,
    reason text,
    referred_by character varying(100),
    total_amount numeric DEFAULT 0,
    amount_paid numeric DEFAULT 0,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    reference character varying(255),
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.enrollments OWNER TO denskill_database_user;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO denskill_database_user;

--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: instructors; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.instructors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    specialty character varying(255) NOT NULL,
    role character varying(100) DEFAULT 'Instructor'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.instructors OWNER TO denskill_database_user;

--
-- Name: instructors_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.instructors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instructors_id_seq OWNER TO denskill_database_user;

--
-- Name: instructors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.instructors_id_seq OWNED BY public.instructors.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO denskill_database_user;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO denskill_database_user;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: scholarship_applications; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.scholarship_applications (
    id integer NOT NULL,
    cohort_id integer,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    country character varying(100) NOT NULL,
    course character varying(150) NOT NULL,
    educational_background text,
    technical_background text,
    reason_for_applying text,
    motivation text,
    portfolio_url text,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    admin_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    referred_by character varying(255)
);


ALTER TABLE public.scholarship_applications OWNER TO denskill_database_user;

--
-- Name: scholarship_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.scholarship_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scholarship_applications_id_seq OWNER TO denskill_database_user;

--
-- Name: scholarship_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.scholarship_applications_id_seq OWNED BY public.scholarship_applications.id;


--
-- Name: scholarship_awards; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.scholarship_awards (
    id integer NOT NULL,
    application_id integer,
    original_amount numeric(10,2) DEFAULT 80000.00,
    student_contribution_percentage integer DEFAULT 20,
    student_amount numeric(10,2) DEFAULT 16000.00,
    scholarship_amount numeric(10,2) DEFAULT 64000.00,
    currency character varying(10) DEFAULT 'NGN'::character varying,
    payment_reference character varying(100),
    payment_status character varying(50) DEFAULT 'PENDING'::character varying,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.scholarship_awards OWNER TO denskill_database_user;

--
-- Name: scholarship_awards_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.scholarship_awards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scholarship_awards_id_seq OWNER TO denskill_database_user;

--
-- Name: scholarship_awards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.scholarship_awards_id_seq OWNED BY public.scholarship_awards.id;


--
-- Name: scholarship_cohorts; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.scholarship_cohorts (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    application_open_date date NOT NULL,
    application_close_date date NOT NULL,
    status character varying(50) DEFAULT 'UPCOMING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.scholarship_cohorts OWNER TO denskill_database_user;

--
-- Name: scholarship_cohorts_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.scholarship_cohorts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scholarship_cohorts_id_seq OWNER TO denskill_database_user;

--
-- Name: scholarship_cohorts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.scholarship_cohorts_id_seq OWNED BY public.scholarship_cohorts.id;


--
-- Name: scholarship_payments; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.scholarship_payments (
    id integer NOT NULL,
    application_id integer,
    cohort_id integer,
    reference character varying(150) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'NGN'::character varying,
    provider character varying(50) DEFAULT 'FLUTTERWAVE'::character varying,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    payment_type character varying(50) DEFAULT 'SCHOLARSHIP_CONTRIBUTION'::character varying,
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.scholarship_payments OWNER TO denskill_database_user;

--
-- Name: scholarship_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.scholarship_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scholarship_payments_id_seq OWNER TO denskill_database_user;

--
-- Name: scholarship_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.scholarship_payments_id_seq OWNED BY public.scholarship_payments.id;


--
-- Name: student_submissions; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.student_submissions (
    id integer NOT NULL,
    student_id integer,
    assessment_id integer,
    score numeric,
    status character varying(50) DEFAULT 'submitted'::character varying,
    feedback text,
    graded_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_submissions OWNER TO denskill_database_user;

--
-- Name: student_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.student_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_submissions_id_seq OWNER TO denskill_database_user;

--
-- Name: student_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.student_submissions_id_seq OWNED BY public.student_submissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: denskill_database_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    role character varying(50) DEFAULT 'student'::character varying,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'active'::character varying,
    student_type character varying(50) DEFAULT 'REGULAR'::character varying,
    scholarship_status character varying(50) DEFAULT NULL::character varying,
    cohort_id integer,
    student_id_number character varying(100) DEFAULT NULL::character varying,
    first_name character varying(255),
    middle_name character varying(255),
    last_name character varying(255),
    phone character varying(50)
);


ALTER TABLE public.users OWNER TO denskill_database_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: denskill_database_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO denskill_database_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: denskill_database_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- Name: attendance_logs id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.attendance_logs ALTER COLUMN id SET DEFAULT nextval('public.attendance_logs_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: instructors id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.instructors ALTER COLUMN id SET DEFAULT nextval('public.instructors_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: scholarship_applications id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_applications ALTER COLUMN id SET DEFAULT nextval('public.scholarship_applications_id_seq'::regclass);


--
-- Name: scholarship_awards id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_awards ALTER COLUMN id SET DEFAULT nextval('public.scholarship_awards_id_seq'::regclass);


--
-- Name: scholarship_cohorts id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_cohorts ALTER COLUMN id SET DEFAULT nextval('public.scholarship_cohorts_id_seq'::regclass);


--
-- Name: scholarship_payments id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_payments ALTER COLUMN id SET DEFAULT nextval('public.scholarship_payments_id_seq'::regclass);


--
-- Name: student_submissions id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.student_submissions ALTER COLUMN id SET DEFAULT nextval('public.student_submissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.assessments (id, title, total_marks, weight, created_at) FROM stdin;
\.


--
-- Data for Name: attendance_logs; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.attendance_logs (id, student_id, course_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.courses (id, title, description, tutor_id, created_at) FROM stdin;
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.enrollments (id, user_id, first_name, middle_name, last_name, country, phone, email, course, reason, referred_by, total_amount, amount_paid, payment_status, reference, expires_at, created_at) FROM stdin;
2	2	AISHA	AYOMIDE	AJALA	NIGERIA	08100349637	ajalaaisha3@gmail.com	Data Analysis	I am interested in learning data analysis to improve my skills in tech and many more	Billy	80000	80000	completed	rvr3wfy4ey	\N	2026-08-04 09:25:26.729767
3	3	Maiva	Happy	Jones	Nigeria	+234 9049340343	maivajames2021@gmail.com	Product Design (UI/UX)	I want to transition into tech as a UI/UX Designer. I’m passionate about creating digital products that are easy and enjoyable to use.  With the high demand for designers and the free Graphic Design training included, this course is the best way for me to build job-ready skills and a portfolio in 6 months.	QAMALDEEN ADAMU	80000	20000	partial	manual_1785864426454	2026-10-20 17:27:05.338	2026-08-04 17:27:06.477774
4	4	Ayomide	Abiodun	Jayeola	Nigeria	+2349155089872	jayeolaayomide54@gmail.com	Data Analysis	Denskill is company that has the program I want to do and I'm happy to apply	Billy 	80000	30000	partial	manual_1785864582991	2026-10-20 17:29:41.935	2026-08-04 17:29:43.017397
5	5	Abubakar	Alabi	Oparemi	Nigeria	+2348133744696	oparemiabubakar8@gmail.com	Product Design (UI/UX)	I want to learn Product Design (UI/UX) because I want to develop a valuable digital skill that allows me to solve real-world problems by designing user-friendly websites and mobile apps. I also want to build a career in tech, work remotely or freelance, and eventually teach others while earning a sustainable income.	Billy	80000	20000	partial	manual_1785864834157	2026-10-20 17:33:53.077	2026-08-04 17:33:54.180284
6	6	YUSUF	OLAMIDE	ABDULKAREEM	NIGERIA	09151562122	heymide66@gmail.com	Frontend Development	for siwes and to learn	billy 	80000	80000	completed	iknwq5yueu	\N	2026-08-05 08:42:51.211671
\.


--
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.instructors (id, name, email, specialty, role, created_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
1	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJvcGFyZW1pYWJ1YmFrYXI4QGdtYWlsLmNvbSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzg2OTc0MjgzLCJleHAiOjE3ODc1NzkwODN9.VM0j6d37yRbx3j7_IAAw95qz8UDBfi7u0nyC58Qe6o4	2026-08-24 13:44:43.306+00	2026-08-17 13:44:43.332391+00
2	6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJoZXltaWRlNjZAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3ODcxMzczNTYsImV4cCI6MTc4Nzc0MjE1Nn0.iOZV-Bzhm9OBlSKKog1QzgHpGna5rVPCAwfZTTSx3UU	2026-08-26 11:02:36.334+00	2026-08-19 11:02:36.364434+00
3	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0MjgzMSwiZXhwIjoxNzg3NzQ3NjMxfQ.FAz1Airg8de7RKkYIKqVG7xd5cIGxS-egHaAIEl1vLI	2026-08-26 12:33:51.039+00	2026-08-19 12:33:51.498053+00
4	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0MzA3NCwiZXhwIjoxNzg3NzQ3ODc0fQ.t8FTH5hrXXqTCvRKpFjzToFi3EsNOGyWOQsKWkb8HmQ	2026-08-26 12:37:54.021+00	2026-08-19 12:37:54.471056+00
5	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0MzU0NCwiZXhwIjoxNzg3NzQ4MzQ0fQ.kiwXXvEdGSGtaeQg9Gg2zq0uckEHKXKsCFVQwAdh-nY	2026-08-26 12:45:44.254+00	2026-08-19 12:45:44.704266+00
6	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0NDM3MywiZXhwIjoxNzg3NzQ5MTczfQ.9UioKRaHRa6PZFtHvkT6UZALz5wBgtYaPaVP4u6E4DU	2026-08-26 12:59:33.402+00	2026-08-19 12:59:33.850549+00
7	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0NjIzOSwiZXhwIjoxNzg3NzUxMDM5fQ.qrDEG6f83xiEHkg0rd5mXcdkbiOrg0xT9bmrZezJ2Ds	2026-08-26 13:30:39.325+00	2026-08-19 13:30:39.76267+00
8	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0NzMyMCwiZXhwIjoxNzg3NzUyMTIwfQ.ntcO2oEue0N8Npo7928u4Ea1anYNUVIuf1rz9eBskik	2026-08-26 13:48:40.383+00	2026-08-19 13:48:40.836575+00
9	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0ODkzNiwiZXhwIjoxNzg3NzUzNzM2fQ.xdK11lVc6rWH2EsAFNZ4_dChT7GiITOWGaq8wFObNZk	2026-08-26 14:15:36.932+00	2026-08-19 14:15:37.363966+00
10	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE0OTg0NywiZXhwIjoxNzg3NzU0NjQ3fQ.xOkvi9i32KgHK7gDqa-4HP8vrHa0qvayMqPaT7arMhw	2026-08-26 14:30:47.824+00	2026-08-19 14:30:48.284487+00
11	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE1MDg0OSwiZXhwIjoxNzg3NzU1NjQ5fQ.TDwj5VXEOcqBDcAFEHpqoQTzc25OkH9PIfr_W_CH5w4	2026-08-26 14:47:29.811+00	2026-08-19 14:47:30.276963+00
12	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE1MjAwOCwiZXhwIjoxNzg3NzU2ODA4fQ.qHiRr1BQqeH0iXj6s_-sDTIMBaD5zZh_DZ1pZO61nks	2026-08-26 15:06:48.244+00	2026-08-19 15:06:48.76998+00
13	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE1MzU4MCwiZXhwIjoxNzg3NzU4MzgwfQ.AmfGzaQYHnMbPyTt2gLrf4Lv-uRLF2YXwnagZFvaZ1M	2026-08-26 15:33:00.077+00	2026-08-19 15:33:00.108402+00
14	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE1MzU5MSwiZXhwIjoxNzg3NzU4MzkxfQ.X1AvT-Z68AC7XpOzjWtfE3nqeJlNwtX7IOP1R8Q10BY	2026-08-26 15:33:11.579+00	2026-08-19 15:33:11.609656+00
15	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE1NjAwNywiZXhwIjoxNzg3NzYwODA3fQ.-iobOezd9Uhm9JwYLNGTThH533bFubfslkS5tz3lHwg	2026-08-26 16:13:27.153+00	2026-08-19 16:13:27.599751+00
16	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzE1NjEzNCwiZXhwIjoxNzg3NzYwOTM0fQ.Mg7PJAIFwZy64dGda_l1cTHPjmHIeQynbgD7piTi4R4	2026-08-26 16:15:34.635+00	2026-08-19 16:15:35.218789+00
17	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIwNzQ1NSwiZXhwIjoxNzg3ODEyMjU1fQ.mUCKf3O-LilDWT3vn7eErSmCkMvhIixxdWDY6GSGGf4	2026-08-27 06:30:55.147+00	2026-08-20 06:30:55.554548+00
18	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIxNTU5NSwiZXhwIjoxNzg3ODIwMzk1fQ.YoOKm00ClwzPmrpQYRQ83t9KkERMwJfwBdCTjHL39qQ	2026-08-27 08:46:35.669+00	2026-08-20 08:46:36.065495+00
19	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIxOTcxNCwiZXhwIjoxNzg3ODI0NTE0fQ.rdhv73SIuuuiux3zO466C4oZXKqK5EX0R0TzyvDwc6c	2026-08-27 09:55:14.092+00	2026-08-20 09:55:14.479161+00
20	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIyMDMxOSwiZXhwIjoxNzg3ODI1MTE5fQ.vqpxUsLIspv-drO9U53hdjv2L3FSBS32m0f2PeubAUY	2026-08-27 10:05:19.089+00	2026-08-20 10:05:19.573324+00
21	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIyMTU1OCwiZXhwIjoxNzg3ODI2MzU4fQ.rdf33fLNzXXUONxw4lUaYXFA_F-G3LMfsdpg2yNyRkU	2026-08-27 10:25:58.587+00	2026-08-20 10:25:58.98501+00
22	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIyNDAxOSwiZXhwIjoxNzg3ODI4ODE5fQ.3vHg2xir_XCgtt3dHZW0tHRQijtQDfHX8oq3goC_tfA	2026-08-27 11:06:59.676+00	2026-08-20 11:06:59.702033+00
23	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIyNTA1NywiZXhwIjoxNzg3ODI5ODU3fQ.joS0autxnVuWYzqlrMSHpSVuXWM3Kur_FBDFZciMKLs	2026-08-27 11:24:17.875+00	2026-08-20 11:24:18.273068+00
24	0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiZW1haWwiOiJsbHV4dXJ5NjkyQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzIyNjExNiwiZXhwIjoxNzg3ODMwOTE2fQ.u9Cmr4CkJMr-pZeLUX2BF3MdM3LLnAaFmOZrKzt3mLs	2026-08-27 11:41:56.579+00	2026-08-20 11:41:56.95161+00
\.


--
-- Data for Name: scholarship_applications; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.scholarship_applications (id, cohort_id, first_name, last_name, email, phone, country, course, educational_background, technical_background, reason_for_applying, motivation, portfolio_url, status, admin_notes, created_at, updated_at, referred_by) FROM stdin;
3	1	Samuel 	Chinedu 	akagbusisamuel@gmail.com	07045645857	Nigeria	Product Design (UI/UX)	\N	\N	\N	To be better and learn more 	\N	PENDING	\N	2026-08-20 10:45:59.567303	2026-08-20 10:45:59.567303	Social Media
4	1	Eric	Adefila	ericadefiladavid@gmail.com	+2349034607562	Nigeria	AI / Machine Learning	\N	\N	\N	I want to learn this skills because I want it as a source of income 	\N	PENDING	\N	2026-08-20 11:09:10.235347	2026-08-20 11:09:10.235347	Social Media
1	1	Hilosthone	Sulyman	solihullahsulyman@gmail.com	09051772499	Nigeria	Cybersecurity	B.sc Computer Science	Full stack and mobile developer				AWAITING_PAYMENT	100% approved	2026-08-19 15:01:02.166074	2026-08-20 11:25:27.254018	\N
2	1	Damilola	balogun	lluxury692@gmail.com	+2348134984001	Nigeria	Full Stack Development	R					AWAITING_PAYMENT	Application approved. Proceed to contribution payment.	2026-08-19 16:10:52.364317	2026-08-20 11:36:48.904049	\N
\.


--
-- Data for Name: scholarship_awards; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.scholarship_awards (id, application_id, original_amount, student_contribution_percentage, student_amount, scholarship_amount, currency, payment_reference, payment_status, expires_at, created_at, updated_at) FROM stdin;
1	2	80000.00	20	16000.00	64000.00	NGN	SCH-1-2FE5DE1D	PENDING	2026-08-27 09:56:46.023194	2026-08-20 09:56:46.023194	2026-08-20 09:56:46.023194
2	1	80000.00	20	16000.00	64000.00	NGN	SCH-1-F1961C08	PENDING	2026-08-27 11:08:14.169529	2026-08-20 11:08:14.169529	2026-08-20 11:08:14.169529
3	2	80000.00	20	16000.00	64000.00	NGN	SCH-1-B58FB67E	PENDING	2026-08-27 11:09:10.660796	2026-08-20 11:09:10.660796	2026-08-20 11:09:10.660796
4	1	80000.00	20	16000.00	64000.00	NGN	SCH-1-69E30347	PENDING	2026-08-27 11:25:27.30837	2026-08-20 11:25:27.30837	2026-08-20 11:25:27.30837
5	2	80000.00	20	16000.00	64000.00	NGN	SCH-1-96A32CC9	PENDING	2026-08-27 11:36:48.966047	2026-08-20 11:36:48.966047	2026-08-20 11:36:48.966047
\.


--
-- Data for Name: scholarship_cohorts; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.scholarship_cohorts (id, name, code, start_date, end_date, application_open_date, application_close_date, status, created_at, updated_at) FROM stdin;
1	Denskill Scholarship Program C1	SCH-C1-2026	2026-09-01	2026-11-20	2026-08-19	2026-10-01	active	2026-08-19 13:50:53.819126	2026-08-19 14:31:10.243801
\.


--
-- Data for Name: scholarship_payments; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.scholarship_payments (id, application_id, cohort_id, reference, amount, currency, provider, status, payment_type, paid_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_submissions; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.student_submissions (id, student_id, assessment_id, score, status, feedback, graded_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: denskill_database_user
--

COPY public.users (id, name, email, password, role, is_verified, created_at, status, student_type, scholarship_status, cohort_id, student_id_number, first_name, middle_name, last_name, phone) FROM stdin;
2	AISHA AJALA	ajalaaisha3@gmail.com	$2b$10$YuuRUervYaq9ZyLwCjmjAOR1P0Wh8fka4bX1l5fSRcmAO7fya5fNm	student	t	2026-08-04 09:25:25.947167	active	REGULAR	\N	\N	\N	\N	\N	\N	\N
3	Maiva Jones	maivajames2021@gmail.com	$2b$10$vS5rpQJ/7f9swlDc8aFBl.qH78PZaMEGDRRhwkVmdtIC/Cx0/O8.y	student	t	2026-08-04 17:27:06.368246	active	REGULAR	\N	\N	\N	\N	\N	\N	\N
4	Ayomide Jayeola	jayeolaayomide54@gmail.com	$2b$10$dwg.0.THM9dDOZh8ExfKcel9c/4u7T3NDMtrF1nByT.nt.l0PhDpy	student	t	2026-08-04 17:29:42.867261	active	REGULAR	\N	\N	\N	\N	\N	\N	\N
5	Abubakar Oparemi	oparemiabubakar8@gmail.com	$2b$10$FjOIz2ChU0tJcAG1H9eMpuk1r00hbFsVcyI7d/HEpf8qvcxpRh8n.	student	t	2026-08-04 17:33:54.066069	active	REGULAR	\N	\N	\N	\N	\N	\N	\N
6	YUSUF ABDULKAREEM	heymide66@gmail.com	$2b$10$VwQ7mTc0B9SD8FrzDAfd...BsV6CbCo2oEoFf1y/ca/pE/PoRPQq.	student	t	2026-08-05 08:42:50.471016	active	REGULAR	\N	\N	\N	\N	\N	\N	\N
7	tope Joshua	topee989@gmail.com	\N	student	f	2026-08-05 18:19:53.56674	active	REGULAR	\N	\N	\N	\N	\N	\N	\N
8	Soliu Sulyman	solihullahsulyman@gmail.com	\N	student	f	2026-08-06 08:34:33.798462	active	REGULAR	frozen	\N	\N	\N	\N	\N	\N
\.


--
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.assessments_id_seq', 1, false);


--
-- Name: attendance_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.attendance_logs_id_seq', 1, false);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.courses_id_seq', 1, false);


--
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 6, true);


--
-- Name: instructors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.instructors_id_seq', 1, false);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 24, true);


--
-- Name: scholarship_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.scholarship_applications_id_seq', 4, true);


--
-- Name: scholarship_awards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.scholarship_awards_id_seq', 5, true);


--
-- Name: scholarship_cohorts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.scholarship_cohorts_id_seq', 1, true);


--
-- Name: scholarship_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.scholarship_payments_id_seq', 1, false);


--
-- Name: student_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.student_submissions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: denskill_database_user
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: attendance_logs attendance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.attendance_logs
    ADD CONSTRAINT attendance_logs_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: instructors instructors_email_key; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_email_key UNIQUE (email);


--
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: scholarship_applications scholarship_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_applications
    ADD CONSTRAINT scholarship_applications_pkey PRIMARY KEY (id);


--
-- Name: scholarship_awards scholarship_awards_payment_reference_key; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_awards
    ADD CONSTRAINT scholarship_awards_payment_reference_key UNIQUE (payment_reference);


--
-- Name: scholarship_awards scholarship_awards_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_awards
    ADD CONSTRAINT scholarship_awards_pkey PRIMARY KEY (id);


--
-- Name: scholarship_cohorts scholarship_cohorts_code_key; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_cohorts
    ADD CONSTRAINT scholarship_cohorts_code_key UNIQUE (code);


--
-- Name: scholarship_cohorts scholarship_cohorts_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_cohorts
    ADD CONSTRAINT scholarship_cohorts_pkey PRIMARY KEY (id);


--
-- Name: scholarship_payments scholarship_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_payments
    ADD CONSTRAINT scholarship_payments_pkey PRIMARY KEY (id);


--
-- Name: scholarship_payments scholarship_payments_reference_key; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_payments
    ADD CONSTRAINT scholarship_payments_reference_key UNIQUE (reference);


--
-- Name: student_submissions student_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.student_submissions
    ADD CONSTRAINT student_submissions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_student_id_number_key; Type: CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_student_id_number_key UNIQUE (student_id_number);


--
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: denskill_database_user
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: attendance_logs attendance_logs_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.attendance_logs
    ADD CONSTRAINT attendance_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: courses courses_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: scholarship_applications scholarship_applications_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_applications
    ADD CONSTRAINT scholarship_applications_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.scholarship_cohorts(id) ON DELETE CASCADE;


--
-- Name: scholarship_awards scholarship_awards_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_awards
    ADD CONSTRAINT scholarship_awards_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.scholarship_applications(id) ON DELETE CASCADE;


--
-- Name: scholarship_payments scholarship_payments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_payments
    ADD CONSTRAINT scholarship_payments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.scholarship_applications(id) ON DELETE CASCADE;


--
-- Name: scholarship_payments scholarship_payments_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.scholarship_payments
    ADD CONSTRAINT scholarship_payments_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.scholarship_cohorts(id) ON DELETE CASCADE;


--
-- Name: student_submissions student_submissions_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.student_submissions
    ADD CONSTRAINT student_submissions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: student_submissions student_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: denskill_database_user
--

ALTER TABLE ONLY public.student_submissions
    ADD CONSTRAINT student_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO denskill_database_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO denskill_database_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO denskill_database_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO denskill_database_user;


--
-- PostgreSQL database dump complete
--

\unrestrict UhC4oUyrYchVgfbfvevCWrEHPwkyjgFdGQgIIOYxQcW73mCOc5pDq8PfnW4t9yH

