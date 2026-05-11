-- ============================================================
-- ShopHub — Migration Supabase complète
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── 1. PROFILES ──────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        text not null default 'client' check (role in ('client','vendor','admin')),
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;

create policy "Profiles visibles par tous" on public.profiles for select using (true);
create policy "Utilisateur modifie son propre profil" on public.profiles for update using (auth.uid() = id);
create policy "Insert profil à l'inscription" on public.profiles for insert with check (auth.uid() = id);

-- Trigger: créer profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. CATÉGORIES ─────────────────────────────────────────────
create table public.categories (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  slug        text not null unique,
  icon        text default '📦',
  parent_id   uuid references public.categories(id),
  created_at  timestamptz default now()
);
alter table public.categories enable row level security;
create policy "Catégories publiques" on public.categories for select using (true);
create policy "Admin gère catégories" on public.categories for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Données initiales
insert into public.categories (name, slug, icon) values
  ('Électronique',  'electronique',  '📱'),
  ('Mode',          'mode',          '👗'),
  ('Maison',        'maison',        '🏠'),
  ('Livres',        'livres',        '📚'),
  ('Sport',         'sport',         '⚽'),
  ('Gaming',        'gaming',        '🎮'),
  ('Beauté',        'beaute',        '💄'),
  ('Alimentation',  'alimentation',  '🥗');

-- ── 3. VENDORS ────────────────────────────────────────────────
create table public.vendors (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade unique,
  shop_name     text not null,
  description   text,
  logo_url      text,
  banner_url    text,
  status        text not null default 'active' check (status in ('pending','active','suspended')),
  rating        numeric(3,2) default 0,
  total_sales   integer default 0,
  created_at    timestamptz default now()
);
alter table public.vendors enable row level security;
create policy "Vendors visibles par tous" on public.vendors for select using (true);
create policy "Vendeur modifie sa boutique" on public.vendors for update
  using (user_id = auth.uid());
create policy "Vendeur crée sa boutique" on public.vendors for insert
  with check (user_id = auth.uid());
create policy "Admin gère vendors" on public.vendors for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ── 4. PRODUCTS ───────────────────────────────────────────────
create table public.products (
  id            uuid default uuid_generate_v4() primary key,
  vendor_id     uuid references public.vendors(id) on delete cascade not null,
  category_id   uuid references public.categories(id),
  name          text not null,
  description   text,
  price         numeric(10,2) not null check (price > 0),
  compare_price numeric(10,2),
  stock         integer not null default 0 check (stock >= 0),
  sku           text,
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  image_url     text,
  images        text[] default '{}',
  total_sold    integer default 0,
  rating        numeric(3,2) default 0,
  review_count  integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.products enable row level security;

create policy "Produits publiés visibles par tous" on public.products
  for select using (status = 'published' or vendor_id in (
    select id from public.vendors where user_id = auth.uid()
  ) or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Vendeur gère ses produits" on public.products for all
  using (vendor_id in (select id from public.vendors where user_id = auth.uid()));

create policy "Admin gère tous les produits" on public.products for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger products_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

-- ── 5. CART ITEMS ─────────────────────────────────────────────
create table public.cart_items (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  product_id  uuid references public.products(id) on delete cascade not null,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.cart_items enable row level security;
create policy "Cart privé par utilisateur" on public.cart_items for all
  using (user_id = auth.uid());

-- ── 6. ADDRESSES ──────────────────────────────────────────────
create table public.addresses (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  full_name   text not null,
  street      text not null,
  city        text not null,
  zip         text not null,
  country     text not null default 'Madagascar',
  phone       text,
  is_default  boolean default false,
  created_at  timestamptz default now()
);
alter table public.addresses enable row level security;
create policy "Adresses privées" on public.addresses for all using (user_id = auth.uid());

-- ── 7. ORDERS ─────────────────────────────────────────────────
create table public.orders (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) not null,
  address_id          uuid references public.addresses(id),
  subtotal            numeric(10,2) not null,
  shipping            numeric(10,2) default 0,
  discount            numeric(10,2) default 0,
  total               numeric(10,2) not null,
  status              text not null default 'pending'
                        check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status      text not null default 'pending'
                        check (payment_status in ('pending','paid','failed','refunded')),
  payment_method      text default 'stripe',
  stripe_session_id   text,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Client voit ses commandes" on public.orders for select
  using (user_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Client crée une commande" on public.orders for insert with check (user_id = auth.uid());
create policy "Admin gère commandes" on public.orders for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');
create trigger orders_updated_at before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ── 8. ORDER ITEMS ────────────────────────────────────────────
create table public.order_items (
  id              uuid default uuid_generate_v4() primary key,
  order_id        uuid references public.orders(id) on delete cascade not null,
  product_id      uuid references public.products(id) not null,
  vendor_id       uuid references public.vendors(id) not null,
  product_name    text not null,
  product_image   text,
  quantity        integer not null check (quantity > 0),
  unit_price      numeric(10,2) not null,
  total_price     numeric(10,2) not null,
  created_at      timestamptz default now()
);
alter table public.order_items enable row level security;
create policy "Voir order items de ses commandes" on public.order_items for select
  using (
    order_id in (select id from public.orders where user_id = auth.uid())
    or vendor_id in (select id from public.vendors where user_id = auth.uid())
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );
create policy "Créer order items" on public.order_items for insert
  with check (order_id in (select id from public.orders where user_id = auth.uid()));

-- Trigger: décrémenter le stock après commande
create or replace function public.decrement_stock()
returns trigger language plpgsql security definer as $$
begin
  update public.products
  set stock = stock - new.quantity,
      total_sold = total_sold + new.quantity
  where id = new.product_id;
  return new;
end;
$$;
create trigger after_order_item_insert
  after insert on public.order_items
  for each row execute procedure public.decrement_stock();

-- ── 9. REVIEWS ────────────────────────────────────────────────
create table public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) not null,
  product_id  uuid references public.products(id) on delete cascade not null,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.reviews enable row level security;
create policy "Avis publics" on public.reviews for select using (true);
create policy "Client crée un avis" on public.reviews for insert with check (user_id = auth.uid());
create policy "Client modifie son avis" on public.reviews for update using (user_id = auth.uid());

-- Trigger: mettre à jour la note du produit
create or replace function public.update_product_rating()
returns trigger language plpgsql security definer as $$
begin
  update public.products
  set rating = (select avg(rating) from public.reviews where product_id = new.product_id),
      review_count = (select count(*) from public.reviews where product_id = new.product_id)
  where id = new.product_id;
  return new;
end;
$$;
create trigger after_review_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_product_rating();

-- ── 10. STORAGE BUCKET ────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict do nothing;

create policy "Images publiques" on storage.objects for select
  using (bucket_id = 'products');
create policy "Vendeur upload images" on storage.objects for insert
  with check (bucket_id = 'products' and auth.role() = 'authenticated');
create policy "Vendeur supprime ses images" on storage.objects for delete
  using (bucket_id = 'products' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── FIN ───────────────────────────────────────────────────────
