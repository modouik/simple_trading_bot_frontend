# UI Contract (Design Freeze)

This document lists the UI building blocks in the current NextJS template. No layout, spacing, color, or component structure changes were made.

## Source Directories

- `src/components`: Feature and domain components
- `src/layout`: Header, sidebar, footer, wrappers
- `src/elements`: Low-level UI elements

## Components Inventory

All component names are derived from file names. Grouped by top-level folder in `src/components`.

### account

- `ProfilePasswordTab`
- `ProfileSettingTab`
- `VendorProfile`
- `index`

### attachment

- `AttachmentData`
- `AttachmentDropdown`
- `AttachmentHead`
- `AttachmentModal`
- `AttachmentModalNav`
- `MediaData`
- `ModalButton`
- `Tab1Form`
- `TopSection`
- `index`

### attribute

- `AttributeForm`
- `AttributeInputs`
- `AttributesTable`

### auth

- `RegistrationFormObjects`
- `UserAddress`
- `UserContact`
- `UserPersonalInfo`

### blog

- `AllBlogsTable`
- `BlogForm`

### category

- `CategoriesTable`
- `CategoryForm`
- `SearchCategory`
- `TreeForm`
- `TreeLine`

### commission

- `index`

### commonComponent

- `Avatar`
- `Loader`
- `LogoWrapper/BackButton`
- `LogoWrapper/Logo`
- `LogoWrapper/ToggleButton`
- `LogoWrapper/index`
- `NoDataFound`

### coupon

- `AllCouponTable`
- `CouponForm`
- `CouponInitialValues`
- `CouponValidation`
- `GeneralTabContent`
- `RestrictionTabContent`
- `TabTitle`
- `UsageTabContent`

### currency

- `AllCurrency`
- `CurrencyForm`
- `CurrencySymbol`

### dashboard

- `ChartData`
- `DashboardChart`
- `DashboardWrapper`
- `Revenue&TopVendor`
- `TopDashSection`
- `index`
- `productStockReport/LatestBlogs`
- `productStockReport/ProductStockReport`
- `productStockReport/ProductStockReportTable`
- `productStockReport/ReviewCard`
- `recentOrders/RecentOrderTable`
- `recentOrders/RecentOrders`
- `recentOrders/TopSellingProduct`
- `topStore/TopStore`
- `topStore/TopStoreTable`

### faq

- `FaqForm`
- `index`

### homePages

- `CommonRedirect`
- `homePage1/AllTabsHomePage1`
- `homePage1/FeatureBannerTab`
- `homePage1/HomeBannerTab`
- `homePage1/HomePage1InitialValue`
- `homePage1/HomePage1Submit`
- `homePage1/LeftSideBanner`
- `homePage1/LeftSidebar`
- `homePage1/MainContentTab`
- `homePage1/NewsLetterTab`
- `homePage1/RightContent`
- `homePage1/RightSection1`
- `homePage1/RightSection2`
- `homePage1/RightSection3`
- `homePage1/RightSection4`
- `homePage1/RightSection5`
- `homePage1/RightSection6`
- `homePage1/RightSection7`
- `homePage1/RightSection8`
- `homePage1/RightSection9`
- `homePage1/index`
- `homePage2/AllTabsHomePage2`
- `homePage2/CategoriesIconTab`
- `homePage2/FullWidthBanner`
- `homePage2/HomePage2InitialValue`
- `homePage2/HomePage2Submit`
- `homePage2/HomePageBanner`
- `homePage2/MainContentTab`
- `homePage2/MainLeftSidebar`
- `homePage2/MainLeftSidebarProduct1`
- `homePage2/MainLeftSidebarProduct2`
- `homePage2/MainLeftSidebarProduct3`
- `homePage2/MainRightBanner1`
- `homePage2/MainRightBanner2`
- `homePage2/MainRightSidebar`
- `homePage2/ProductSlider1`
- `homePage2/ProductSlider2`
- `homePage2/ProductSlider3`
- `homePage2/index`
- `homePage3/AllTabsHomePage3`
- `homePage3/CategoryIconList`
- `homePage3/CouponTab`
- `homePage3/FeatureBlogTab`
- `homePage3/HomeBannerTab`
- `homePage3/HomePage3InitialValue`
- `homePage3/HomePage3Submit`
- `homePage3/NewsLetterTab`
- `homePage3/OfferBannerTab`
- `homePage3/ProductBundleTab`
- `homePage3/ProductList1Tab`
- `homePage3/ProductList2Tab`
- `homePage3/SliderProduct1`
- `homePage3/SliderProduct2`
- `homePage3/SliderProductTab`
- `homePage3/index`
- `homePage4/AllTabsHomePage4`
- `homePage4/CategoriesImageList`
- `homePage4/CategoryProductTab`
- `homePage4/DealOfDaysTab`
- `homePage4/FeatureBlog4`
- `homePage4/FullWidthBanner4`
- `homePage4/HomeBanner4`
- `homePage4/HomePage4InitialValue`
- `homePage4/HomePage4Submit`
- `homePage4/NewsLetter4`
- `homePage4/ProductListTab`
- `homePage4/TwoColumnBanner`
- `homePage4/TwoColumnBanner1`
- `homePage4/ValueBanners`
- `homePage4/index`
- `homePage5/AllHomePage5Tabs`
- `homePage5/BankOfferTab`
- `homePage5/CommonDeliveryBanner`
- `homePage5/DealOfProductTabs`
- `homePage5/DeliveryBanner5Tab`
- `homePage5/FullWidthBanner5`
- `homePage5/HomeBanner5Tab`
- `homePage5/HomePage5InitialValue`
- `homePage5/HomePage5Submit`
- `homePage5/OrderTabs`
- `homePage5/ProductList1Tab`
- `homePage5/ProductListCategory6Tab`
- `homePage5/ProductListTab`
- `homePage5/ProductWithDeals`
- `homePage5/ServiceBannerTab`
- `homePage5/index`
- `homePage6/AllTabsHomePage6`
- `homePage6/FullWidthBanner6Tab`
- `homePage6/HomeBanner6Tab`
- `homePage6/HomePage6InitialValue`
- `homePage6/HomePage6Submit`
- `homePage6/LeftSidebarAccordion1`
- `homePage6/LeftSidebarAccordion2`
- `homePage6/LeftSidebarAccordion3`
- `homePage6/LeftSidebarAccordion4`
- `homePage6/LeftSidebarTab`
- `homePage6/MainContent6Tab`
- `homePage6/RightSidebar6Tab`
- `homePage6/RightSidebarProduct`
- `homePage6/index`
- `homePage7/AllTabsHomePage7`
- `homePage7/CategoryIconListTab7`
- `homePage7/CouponBanner7Tab`
- `homePage7/HomeBanner7Tab`
- `homePage7/HomePage7InitialValue`
- `homePage7/HomePage7Submit`
- `homePage7/MiddleTabs7`
- `homePage7/SliderProduct7Tab`
- `homePage7/SliderProductBannerTab`
- `homePage7/SliderProductSidebar`
- `homePage7/SliderProductSidebar2`
- `homePage7/TwoColumnBanner7Tab`
- `homePage7/index`

### inputFields

- `AddressComponent`
- `CategoryOptions`
- `CheckBoxField`
- `EditorComponent`
- `FileUploadBrowser`
- `FileUploadField`
- `InputField`
- `InputWrapperComponent`
- `MultiDropdownBox`
- `MultiSelectField`
- `MultiSelectInput`
- `SearchableSelectInput`
- `SelectField`
- `SimpleInputField`

### notifications

- `NotificationsData`

### orders

- `AllOrdersTable`
- `details/ConsumerDetails`
- `details/DetailTable`
- `details/InvoiceSummary`
- `details/NumberTable`
- `details/OrderDetailsTable`
- `details/OrderNumberTable`
- `details/RightSidebar`
- `details/TrackingPanel`
- `details/UpdateStatus`
- `details/index`

### pages

- `PageForm`
- `index`

### paymentDetails

- `BankDetailTab`
- `PaypalTab`
- `index`

### pos

- `AllProducts`
- `ApplyCoupon`
- `Category`
- `IncDec`
- `LeftSideModal`
- `PointWallet`
- `PosDetailCard`
- `ProductFilterSection`
- `ProductVariationModal`
- `RightVariationModal`
- `ShowProduct`
- `SilderData`
- `TopCategories`
- `VariationAddToCart`
- `VariationModalQty`
- `checkout/Checkout`
- `checkout/CheckoutSidebar`
- `checkout/CommonAddressForm`
- `checkout/DeliveryAddress`
- `checkout/DeliveryOptions`
- `checkout/PaymentOptions`
- `checkout/PlaceOrder`
- `checkout/SelectCustomer`
- `checkout/ShowAddress`
- `checkout/SidebarCheckoutCard`
- `checkout/UserAddress`
- `checkout/common/CheckoutCard`

### product

- `AllProductTable`
- `AllProductTabs`
- `DateRangePicker`
- `DescriptionInput`
- `GeneralTab`
- `ImagesTab`
- `InventoryTab`
- `OptionsTab`
- `ProductForm`
- `ProductObjects`
- `ProductSubmitFunction`
- `SeoTab`
- `SetupTab`
- `ShippingTaxTab`
- `VariationTop`
- `VariationsForm`
- `VariationsTab`

### qna

- `AnswerModal`
- `QnATable`

### reactstrapFormik

- `ReactstrapFormikInput`
- `ReactstrapRadioInput`
- `ReactstrapSelectInput`
- `index`

### refund

- `AllRefundTable`

### reviews

- `index`

### role

- `AllRolesTable`
- `PermissionForm`
- `PermissionsCheckBoxForm`

### setting

- `ActivationTab`
- `AllTabs`
- `AnalyticsTab`
- `DeliveyTab`
- `EmailTab`
- `GeneralTab`
- `GeneralTab1`
- `GoogleReCaptcha`
- `ImageTab`
- `MaintenanceTab`
- `NewsLetterTab`
- `PaymentMethodsTab`
- `Refund`
- `SeoTab`
- `SettingForm`
- `VendorCommissionTab`
- `WalletPointTab`

### shipping

- `FormContent`
- `FormShipping`
- `FormsShippingRuleCreation`

### store

- `AllStoresTable`
- `StoreForm`
- `StoreInitialValue`
- `StoreValidationSchema`
- `StoreVendor`

### table

- `CalenderFilter`
- `CloseDateRange`
- `DeleteButton`
- `ImportExport`
- `Options`
- `Pagination`
- `ShowTable`
- `Status`
- `TableBottom`
- `TableDeleteOption`
- `TableDuplicateOption`
- `TableLoader`
- `TableTitle`
- `TableTop`
- `ViewDetailBody`
- `ViewDetails`

### tag

- `AllTagsTable`
- `TagForm`

### tax

- `AllTax`
- `TaxForm`

### themeOption

- `BlogTab`
- `CollectionProduct`
- `ContactPageTab`
- `ContactWrapper`
- `ErrorPage`
- `FooterTab`
- `GeneralTab`
- `HeaderTab`
- `ProductLayout`
- `SellerTab`
- `SeoTab`
- `ThemeOptionAllTabs`
- `ThemeOptionInitialValue`
- `ThemeOptionSubmit`
- `TypographyColorTab`
- `aboutUS/AboutTab`
- `aboutUS/BlogTab`
- `aboutUS/ClientTab`
- `aboutUS/TeamTab`
- `aboutUS/TestimonialTab`
- `aboutUS/index`
- `index`
- `sellerDashboard/AboutSeller`
- `sellerDashboard/Selling`
- `sellerDashboard/ServiceSeller`
- `sellerDashboard/ServiceWrapper`
- `sellerDashboard/StepTab`
- `sellerDashboard/StepWrapper`

### user

- `AllUsersTable`
- `UserAddress`
- `UserDetail1`
- `UserForm`
- `UserPassword`
- `UserRole`

### wallet

- `ConfimationModal`
- `SelectUser`
- `SeleteWalletPrice`
- `UserTransactionsTable`
- `WrappedVendor`

### withdrawRequest

- `AllWithdrawRequestTable`
- `VendorDetails`
- `WithdrawModal`

## Layout Components

Grouped by folder in `src/layout`.

### .

- `TanstackWrapper`
- `TapToTop`
- `index`

### authLayout

- `index`

### footer

- `index`

### header

- `AllMenus`
- `Language`
- `NotificationBox`
- `ProfileNav`
- `RightNav`
- `SearchBar`
- `index`

### sidebar

- `MenuData`
- `MenuList`
- `SkeletonSidebar`
- `index`

## Elements

Grouped by folder in `src/elements`.

### .

- `Img`

### alerts&Modals

- `Modal`
- `ShowBox`

### buttons

- `Btn`
- `FormBtn`

### posSkeletonLoader

- `index`

### ratioImage

- `index`

## Fields (Form/Input Components)

From `src/components/inputFields`, `src/components/reactstrapFormik`, and `src/components/auth`.

- `components/auth/RegistrationFormObjects`
- `components/auth/UserAddress`
- `components/auth/UserContact`
- `components/auth/UserPersonalInfo`
- `components/inputFields/AddressComponent`
- `components/inputFields/CategoryOptions`
- `components/inputFields/CheckBoxField`
- `components/inputFields/EditorComponent`
- `components/inputFields/FileUploadBrowser`
- `components/inputFields/FileUploadField`
- `components/inputFields/InputField`
- `components/inputFields/InputWrapperComponent`
- `components/inputFields/MultiDropdownBox`
- `components/inputFields/MultiSelectField`
- `components/inputFields/MultiSelectInput`
- `components/inputFields/SearchableSelectInput`
- `components/inputFields/SelectField`
- `components/inputFields/SimpleInputField`
- `components/reactstrapFormik/ReactstrapFormikInput`
- `components/reactstrapFormik/ReactstrapRadioInput`
- `components/reactstrapFormik/ReactstrapSelectInput`
- `components/reactstrapFormik/index`

## Charts

Components with chart usage in dashboard or file names containing "Chart".

- `components/dashboard/ChartData`
- `components/dashboard/DashboardChart`
- `components/dashboard/Revenue&TopVendor`
