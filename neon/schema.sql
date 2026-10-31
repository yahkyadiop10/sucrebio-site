-- Base Neon du site Sucré Bio (projet « sucrebio », base « sucrebio »).
-- Enregistre les envois des deux formulaires du site. L'envoi WhatsApp reste en place.

CREATE TABLE IF NOT EXISTS messages_contact (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cree_le    timestamptz NOT NULL DEFAULT now(),
  nom        text NOT NULL CHECK (char_length(nom) BETWEEN 2 AND 120),
  telephone  text NOT NULL CHECK (char_length(telephone) BETWEEN 6 AND 40),
  email      text CHECK (email IS NULL OR char_length(email) <= 200),
  sujet      text NOT NULL CHECK (sujet IN ('commande','distributeur','produit','partenariat','autre')),
  message    text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
  langue     text NOT NULL DEFAULT 'fr' CHECK (langue IN ('fr','en')),
  traite     boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS demandes_distributeur (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cree_le    timestamptz NOT NULL DEFAULT now(),
  nom        text NOT NULL CHECK (char_length(nom) BETWEEN 2 AND 120),
  commerce   text NOT NULL CHECK (char_length(commerce) BETWEEN 2 AND 160),
  type       text NOT NULL CHECK (char_length(type) <= 60),
  ville      text NOT NULL CHECK (char_length(ville) BETWEEN 2 AND 120),
  telephone  text NOT NULL CHECK (char_length(telephone) BETWEEN 6 AND 40),
  email      text CHECK (email IS NULL OR char_length(email) <= 200),
  message    text CHECK (message IS NULL OR char_length(message) <= 5000),
  langue     text NOT NULL DEFAULT 'fr' CHECK (langue IN ('fr','en')),
  traite     boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS messages_contact_cree_le ON messages_contact (cree_le DESC);
CREATE INDEX IF NOT EXISTS demandes_distributeur_cree_le ON demandes_distributeur (cree_le DESC);
