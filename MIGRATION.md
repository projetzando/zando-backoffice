# Migration vers le nouveau schéma de base de données

## ✅ Changements effectués

### Types/Interfaces
- ✅ Mis à jour `Product` - supprimé `brand_id`, `sku`, `weight`, etc., ajouté `product_type`, `cover_image`, `images[]`
- ✅ Créé `ProductVariation` - remplace `ProductVariant`  
- ✅ Créé `ProductAttribute` - nouvelle fonctionnalité
- ✅ Mis à jour `Order` - remplacé addresses par `delivery_*`, ajouté `payment_method`, `notes`
- ✅ Mis à jour `OrderItem` - ajouté `product_title`, `variation_name`, `total_price`
- ✅ Simplifié `Seller` - supprimé champs complexes, ajouté `company_description`, etc.
- ✅ Créé nouveaux types : `Conversation`, `Message`, `Review`, `Favorite`, `CartItem`, `Address`

### Stores
- ✅ Mis à jour `product.ts` - nouvelles relations, méthodes pour variations
- ✅ Mis à jour `order.ts` - adaptée au nouveau schéma  
- ✅ Créé `cart.ts` - gestion du panier avec vue `cart_with_details`
- ✅ Créé `conversation.ts` - messagerie vendeur/acheteur
- ✅ Créé `review.ts` - avis produits avec statistiques
- ✅ Créé `favorite.ts` - produits favoris utilisateurs  
- ✅ Créé `address.ts` - gestion adresses utilisateur
- ✅ Supprimé stores obsolètes : `brand.ts`, `currency.ts`, `setting.ts`

### Pages
- ✅ Adapté `/products/index.vue` - colonnes `cover_image`, `product_type`, `is_active` 
- ✅ Adapté `/orders/index.vue` - colonnes `delivery_address`, `payment_method`
- ✅ Mis à jour colonnes et statuts dans `utils/columns/`

### Nettoyage
- ✅ Supprimé modèles obsolètes : `brand.ts`, `currency.ts`, `setting.ts`

## ✅ **Vues Supabase intégrées**

### Vues optimisées
- ✅ `products_with_price` - Produits avec prix calculés, stock total, avis, variations
- ✅ `cart_with_details` - Panier avec détails produits et prix calculés  

### Interfaces exactes
- ✅ `ProductWithPrice` - Correspond exactement aux champs de la vue SQL
- ✅ `CartWithDetails` - Correspond exactement aux champs de la vue SQL

### Stores optimisés
- ✅ `product.ts` - Utilise `products_with_price` par défaut avec `getProductsRaw()` pour l'édition
- ✅ `cart.ts` - Utilise `cart_with_details` par défaut avec `getCartRaw()` pour les manipulations

### Pages mise à jour  
- ✅ `/products/index.vue` - Affiche `display_price`, `available_stock`, notes/avis
- ✅ `/dashboard/test-views.vue` - Page de test pour vérifier l'intégration des vues

## 🚨 Actions supplémentaires nécessaires

### Pages à supprimer/adapter
```bash
# Pages de configuration obsolètes à supprimer
rm -rf pages/dashboard/configurations/brands/
rm -rf pages/dashboard/configurations/currencies/ 
rm -rf pages/dashboard/configurations/settings/
```

### Composants à mettre à jour
- `components/init-data.vue` - supprimer références aux stores obsolètes
- Sidebar navigation - supprimer liens vers pages supprimées

### Nouvelles pages à créer (optionnel)
- `/dashboard/conversations/` - gestion des conversations
- `/dashboard/reviews/` - modération des avis
- `/dashboard/addresses/` - gestion des adresses (si admin)

### Base de données
⚠️ **Important** : Les changements effectués supposent que le nouveau schéma est déjà appliqué en base.
Sinon, appliquer le script SQL fourni dans `new_schema.txt`.

## Fonctionnalités ajoutées

### 1. Système de panier
- Store `cart.ts` avec méthodes complètes
- Support variations de produits
- Vue `cart_with_details` intégrée

### 2. Messagerie
- Conversations vendeur/acheteur  
- Messages avec lien vers produits
- Marquage messages lus/non lus

### 3. Avis produits
- Notation 1-5 étoiles
- Commentaires et images
- Statistiques par produit

### 4. Système de favoris
- Ajout/suppression favoris
- Compteurs par produit

### 5. Gestion d'adresses
- Adresses multiples par utilisateur
- Adresse par défaut
- Intégration commandes

## Migration progressive recommandée

1. ✅ **Phase 1** - Types et stores de base (fait)
2. ✅ **Phase 2** - Pages principales adaptées (fait)  
3. **Phase 3** - Supprimer pages obsolètes
4. **Phase 4** - Créer nouvelles pages de gestion
5. **Phase 5** - Tests et optimisations