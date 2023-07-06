-- Create the database
CREATE DATABASE reptask;

-- Connect to the database
\c reptask;

-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks
(
  id serial NOT NULL,
  title character varying(60) COLLATE pg_catalog."default" NOT NULL,
  description text COLLATE pg_catalog."default",
  deadline timestamp without time zone NOT NULL,
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);

-- Create the reps table
CREATE TABLE IF NOT EXISTS public.reps
(
  id serial NOT NULL,
  name character varying(45) COLLATE pg_catalog."default" NOT NULL,
  code character varying(20) COLLATE pg_catalog."default" NOT NULL,
  CONSTRAINT reps_pkey PRIMARY KEY (id)
);

-- Create the item_bonus table
CREATE TABLE IF NOT EXISTS public.item_bonus
(
  id serial NOT NULL,
  title character varying(60) COLLATE pg_catalog."default" NOT NULL,
  value integer NOT NULL,
  CONSTRAINT item_bonus_pkey PRIMARY KEY (id)
);

-- Create the users table
CREATE TABLE IF NOT EXISTS public.users
(
  id serial NOT NULL,
  name character varying(45) COLLATE pg_catalog."default" NOT NULL,
  email character varying(45) COLLATE pg_catalog."default" NOT NULL,
  nickname character varying(45) COLLATE pg_catalog."default" NOT NULL,
  password character varying(100) COLLATE pg_catalog."default" NOT NULL,
  photo text COLLATE pg_catalog."default",
  balance integer DEFAULT 0,
  user_type integer NOT NULL,
  reps_id integer NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT reps_id_fkey FOREIGN KEY (reps_id)
      REFERENCES public.reps (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION
);

-- Create the comments table
CREATE TABLE IF NOT EXISTS public.comments
(
  task_id integer NOT NULL,
  user_id integer NOT NULL,
  comment text COLLATE pg_catalog."default" NOT NULL,
  CONSTRAINT tasks_id_fkey FOREIGN KEY (task_id)
      REFERENCES public.tasks (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION,
  CONSTRAINT users_id_fkey FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE SET NULL
);

-- Create the scores table
CREATE TABLE IF NOT EXISTS public.scores
(
  task_id integer NOT NULL,
  responsible_user integer NOT NULL,
  value integer NOT NULL,
  finished boolean NOT NULL DEFAULT false,
  CONSTRAINT tasks_id_fkey FOREIGN KEY (task_id)
      REFERENCES public.tasks (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION,
  CONSTRAINT users_id_fkey FOREIGN KEY (responsible_user)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE SET NULL
);

-- Create the historic table
CREATE TABLE IF NOT EXISTS public.historic
(
  user_id integer NOT NULL,
  item_id integer NOT NULL,
  CONSTRAINT user_id_fkey FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE NO ACTION,
  CONSTRAINT item_id_fkey FOREIGN KEY (item_id)
      REFERENCES public.item_bonus (id) MATCH SIMPLE
      ON UPDATE NO ACTION
      ON DELETE SET NULL
);

-- função de trigger para alteração de finalização de tarefas
CREATE OR REPLACE FUNCTION update_user_balance()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.finished = true THEN
      UPDATE public.users
      SET balance = balance + (SELECT value FROM public.scores WHERE task_id = NEW.task_id)
      WHERE id = NEW.responsible_user;
    ELSE
      UPDATE public.users
      SET balance = balance - (SELECT value FROM public.scores WHERE task_id = NEW.task_id)
      WHERE id = NEW.responsible_user;
    END IF;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

-- trigger para alteração de status de tarefas
CREATE TRIGGER scores_finished_trigger
AFTER UPDATE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION update_user_balance();

-- função de trigger para resgate de items bonus
CREATE OR REPLACE FUNCTION update_user_balance_on_historic()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE public.users
    SET balance = balance - (SELECT value FROM public.item_bonus WHERE id = NEW.item_id)
    WHERE id = NEW.user_id;
    
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

-- trigger para resgate de items bonus
CREATE TRIGGER historic_insert_trigger
AFTER INSERT ON public.historic
FOR EACH ROW
EXECUTE FUNCTION update_user_balance_on_historic();

