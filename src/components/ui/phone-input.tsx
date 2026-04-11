"use client";

import { useState, useRef, useEffect } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const COUNTRY_CODES = [
  { code: "+93", iso: "AF", name: "Afghanistan" },
  { code: "+355", iso: "AL", name: "Albania" },
  { code: "+213", iso: "DZ", name: "Algeria" },
  { code: "+1-684", iso: "AS", name: "American Samoa" },
  { code: "+376", iso: "AD", name: "Andorra" },
  { code: "+244", iso: "AO", name: "Angola" },
  { code: "+1-264", iso: "AI", name: "Anguilla" },
  { code: "+672", iso: "AQ", name: "Antarctica" },
  { code: "+1-268", iso: "AG", name: "Antigua and Barbuda" },
  { code: "+54", iso: "AR", name: "Argentina" },
  { code: "+374", iso: "AM", name: "Armenia" },
  { code: "+297", iso: "AW", name: "Aruba" },
  { code: "+61", iso: "AU", name: "Australia" },
  { code: "+43", iso: "AT", name: "Austria" },
  { code: "+994", iso: "AZ", name: "Azerbaijan" },
  { code: "+1-242", iso: "BS", name: "Bahamas" },
  { code: "+973", iso: "BH", name: "Bahrain" },
  { code: "+880", iso: "BD", name: "Bangladesh" },
  { code: "+1-246", iso: "BB", name: "Barbados" },
  { code: "+375", iso: "BY", name: "Belarus" },
  { code: "+32", iso: "BE", name: "Belgium" },
  { code: "+501", iso: "BZ", name: "Belize" },
  { code: "+229", iso: "BJ", name: "Benin" },
  { code: "+1-441", iso: "BM", name: "Bermuda" },
  { code: "+975", iso: "BT", name: "Bhutan" },
  { code: "+591", iso: "BO", name: "Bolivia" },
  { code: "+387", iso: "BA", name: "Bosnia and Herzegovina" },
  { code: "+267", iso: "BW", name: "Botswana" },
  { code: "+55", iso: "BR", name: "Brazil" },
  { code: "+246", iso: "IO", name: "British Indian Ocean Territory" },
  { code: "+1-284", iso: "VG", name: "British Virgin Islands" },
  { code: "+673", iso: "BN", name: "Brunei" },
  { code: "+359", iso: "BG", name: "Bulgaria" },
  { code: "+226", iso: "BF", name: "Burkina Faso" },
  { code: "+257", iso: "BI", name: "Burundi" },
  { code: "+855", iso: "KH", name: "Cambodia" },
  { code: "+237", iso: "CM", name: "Cameroon" },
  { code: "+1", iso: "CA", name: "Canada" },
  { code: "+238", iso: "CV", name: "Cape Verde" },
  { code: "+1-345", iso: "KY", name: "Cayman Islands" },
  { code: "+236", iso: "CF", name: "Central African Republic" },
  { code: "+235", iso: "TD", name: "Chad" },
  { code: "+56", iso: "CL", name: "Chile" },
  { code: "+86", iso: "CN", name: "China" },
  { code: "+61", iso: "CX", name: "Christmas Island" },
  { code: "+61", iso: "CC", name: "Cocos Islands" },
  { code: "+57", iso: "CO", name: "Colombia" },
  { code: "+269", iso: "KM", name: "Comoros" },
  { code: "+682", iso: "CK", name: "Cook Islands" },
  { code: "+506", iso: "CR", name: "Costa Rica" },
  { code: "+385", iso: "HR", name: "Croatia" },
  { code: "+53", iso: "CU", name: "Cuba" },
  { code: "+599", iso: "CW", name: "Curacao" },
  { code: "+357", iso: "CY", name: "Cyprus" },
  { code: "+420", iso: "CZ", name: "Czech Republic" },
  { code: "+243", iso: "CD", name: "Democratic Republic of the Congo" },
  { code: "+45", iso: "DK", name: "Denmark" },
  { code: "+253", iso: "DJ", name: "Djibouti" },
  { code: "+1-767", iso: "DM", name: "Dominica" },
  { code: "+1-809", iso: "DO", name: "Dominican Republic" },
  { code: "+670", iso: "TL", name: "East Timor" },
  { code: "+593", iso: "EC", name: "Ecuador" },
  { code: "+20", iso: "EG", name: "Egypt" },
  { code: "+503", iso: "SV", name: "El Salvador" },
  { code: "+240", iso: "GQ", name: "Equatorial Guinea" },
  { code: "+291", iso: "ER", name: "Eritrea" },
  { code: "+372", iso: "EE", name: "Estonia" },
  { code: "+251", iso: "ET", name: "Ethiopia" },
  { code: "+500", iso: "FK", name: "Falkland Islands" },
  { code: "+298", iso: "FO", name: "Faroe Islands" },
  { code: "+679", iso: "FJ", name: "Fiji" },
  { code: "+358", iso: "FI", name: "Finland" },
  { code: "+33", iso: "FR", name: "France" },
  { code: "+689", iso: "PF", name: "French Polynesia" },
  { code: "+241", iso: "GA", name: "Gabon" },
  { code: "+220", iso: "GM", name: "Gambia" },
  { code: "+995", iso: "GE", name: "Georgia" },
  { code: "+49", iso: "DE", name: "Germany" },
  { code: "+233", iso: "GH", name: "Ghana" },
  { code: "+350", iso: "GI", name: "Gibraltar" },
  { code: "+30", iso: "GR", name: "Greece" },
  { code: "+299", iso: "GL", name: "Greenland" },
  { code: "+1-473", iso: "GD", name: "Grenada" },
  { code: "+1-671", iso: "GU", name: "Guam" },
  { code: "+502", iso: "GT", name: "Guatemala" },
  { code: "+44-1481", iso: "GG", name: "Guernsey" },
  { code: "+224", iso: "GN", name: "Guinea" },
  { code: "+245", iso: "GW", name: "Guinea-Bissau" },
  { code: "+592", iso: "GY", name: "Guyana" },
  { code: "+509", iso: "HT", name: "Haiti" },
  { code: "+504", iso: "HN", name: "Honduras" },
  { code: "+852", iso: "HK", name: "Hong Kong" },
  { code: "+36", iso: "HU", name: "Hungary" },
  { code: "+354", iso: "IS", name: "Iceland" },
  { code: "+91", iso: "IN", name: "India" },
  { code: "+62", iso: "ID", name: "Indonesia" },
  { code: "+98", iso: "IR", name: "Iran" },
  { code: "+964", iso: "IQ", name: "Iraq" },
  { code: "+353", iso: "IE", name: "Ireland" },
  { code: "+44-1624", iso: "IM", name: "Isle of Man" },
  { code: "+972", iso: "IL", name: "Israel" },
  { code: "+39", iso: "IT", name: "Italy" },
  { code: "+225", iso: "CI", name: "Ivory Coast" },
  { code: "+1-876", iso: "JM", name: "Jamaica" },
  { code: "+81", iso: "JP", name: "Japan" },
  { code: "+44-1534", iso: "JE", name: "Jersey" },
  { code: "+962", iso: "JO", name: "Jordan" },
  { code: "+7", iso: "KZ", name: "Kazakhstan" },
  { code: "+254", iso: "KE", name: "Kenya" },
  { code: "+686", iso: "KI", name: "Kiribati" },
  { code: "+383", iso: "XK", name: "Kosovo" },
  { code: "+965", iso: "KW", name: "Kuwait" },
  { code: "+996", iso: "KG", name: "Kyrgyzstan" },
  { code: "+856", iso: "LA", name: "Laos" },
  { code: "+371", iso: "LV", name: "Latvia" },
  { code: "+961", iso: "LB", name: "Lebanon" },
  { code: "+266", iso: "LS", name: "Lesotho" },
  { code: "+231", iso: "LR", name: "Liberia" },
  { code: "+218", iso: "LY", name: "Libya" },
  { code: "+423", iso: "LI", name: "Liechtenstein" },
  { code: "+370", iso: "LT", name: "Lithuania" },
  { code: "+352", iso: "LU", name: "Luxembourg" },
  { code: "+853", iso: "MO", name: "Macau" },
  { code: "+389", iso: "MK", name: "Macedonia" },
  { code: "+261", iso: "MG", name: "Madagascar" },
  { code: "+265", iso: "MW", name: "Malawi" },
  { code: "+60", iso: "MY", name: "Malaysia" },
  { code: "+960", iso: "MV", name: "Maldives" },
  { code: "+223", iso: "ML", name: "Mali" },
  { code: "+356", iso: "MT", name: "Malta" },
  { code: "+692", iso: "MH", name: "Marshall Islands" },
  { code: "+222", iso: "MR", name: "Mauritania" },
  { code: "+230", iso: "MU", name: "Mauritius" },
  { code: "+262", iso: "YT", name: "Mayotte" },
  { code: "+52", iso: "MX", name: "Mexico" },
  { code: "+691", iso: "FM", name: "Micronesia" },
  { code: "+373", iso: "MD", name: "Moldova" },
  { code: "+377", iso: "MC", name: "Monaco" },
  { code: "+976", iso: "MN", name: "Mongolia" },
  { code: "+382", iso: "ME", name: "Montenegro" },
  { code: "+1-664", iso: "MS", name: "Montserrat" },
  { code: "+212", iso: "MA", name: "Morocco" },
  { code: "+258", iso: "MZ", name: "Mozambique" },
  { code: "+95", iso: "MM", name: "Myanmar" },
  { code: "+264", iso: "NA", name: "Namibia" },
  { code: "+674", iso: "NR", name: "Nauru" },
  { code: "+977", iso: "NP", name: "Nepal" },
  { code: "+31", iso: "NL", name: "Netherlands" },
  { code: "+599", iso: "AN", name: "Netherlands Antilles" },
  { code: "+687", iso: "NC", name: "New Caledonia" },
  { code: "+64", iso: "NZ", name: "New Zealand" },
  { code: "+505", iso: "NI", name: "Nicaragua" },
  { code: "+227", iso: "NE", name: "Niger" },
  { code: "+234", iso: "NG", name: "Nigeria" },
  { code: "+683", iso: "NU", name: "Niue" },
  { code: "+850", iso: "KP", name: "North Korea" },
  { code: "+1-670", iso: "MP", name: "Northern Mariana Islands" },
  { code: "+47", iso: "NO", name: "Norway" },
  { code: "+968", iso: "OM", name: "Oman" },
  { code: "+92", iso: "PK", name: "Pakistan" },
  { code: "+680", iso: "PW", name: "Palau" },
  { code: "+970", iso: "PS", name: "Palestine" },
  { code: "+507", iso: "PA", name: "Panama" },
  { code: "+675", iso: "PG", name: "Papua New Guinea" },
  { code: "+595", iso: "PY", name: "Paraguay" },
  { code: "+51", iso: "PE", name: "Peru" },
  { code: "+63", iso: "PH", name: "Philippines" },
  { code: "+64", iso: "PN", name: "Pitcairn" },
  { code: "+48", iso: "PL", name: "Poland" },
  { code: "+351", iso: "PT", name: "Portugal" },
  { code: "+1-787", iso: "PR", name: "Puerto Rico" },
  { code: "+974", iso: "QA", name: "Qatar" },
  { code: "+242", iso: "CG", name: "Republic of the Congo" },
  { code: "+262", iso: "RE", name: "Reunion" },
  { code: "+40", iso: "RO", name: "Romania" },
  { code: "+7", iso: "RU", name: "Russia" },
  { code: "+250", iso: "RW", name: "Rwanda" },
  { code: "+590", iso: "BL", name: "Saint Barthelemy" },
  { code: "+290", iso: "SH", name: "Saint Helena" },
  { code: "+1-869", iso: "KN", name: "Saint Kitts and Nevis" },
  { code: "+1-758", iso: "LC", name: "Saint Lucia" },
  { code: "+590", iso: "MF", name: "Saint Martin" },
  { code: "+508", iso: "PM", name: "Saint Pierre and Miquelon" },
  { code: "+1-784", iso: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "+685", iso: "WS", name: "Samoa" },
  { code: "+378", iso: "SM", name: "San Marino" },
  { code: "+239", iso: "ST", name: "Sao Tome and Principe" },
  { code: "+966", iso: "SA", name: "Saudi Arabia" },
  { code: "+221", iso: "SN", name: "Senegal" },
  { code: "+381", iso: "RS", name: "Serbia" },
  { code: "+248", iso: "SC", name: "Seychelles" },
  { code: "+232", iso: "SL", name: "Sierra Leone" },
  { code: "+65", iso: "SG", name: "Singapore" },
  { code: "+1-721", iso: "SX", name: "Sint Maarten" },
  { code: "+421", iso: "SK", name: "Slovakia" },
  { code: "+386", iso: "SI", name: "Slovenia" },
  { code: "+677", iso: "SB", name: "Solomon Islands" },
  { code: "+252", iso: "SO", name: "Somalia" },
  { code: "+27", iso: "ZA", name: "South Africa" },
  { code: "+82", iso: "KR", name: "South Korea" },
  { code: "+211", iso: "SS", name: "South Sudan" },
  { code: "+34", iso: "ES", name: "Spain" },
  { code: "+94", iso: "LK", name: "Sri Lanka" },
  { code: "+249", iso: "SD", name: "Sudan" },
  { code: "+597", iso: "SR", name: "Suriname" },
  { code: "+47", iso: "SJ", name: "Svalbard and Jan Mayen" },
  { code: "+268", iso: "SZ", name: "Swaziland" },
  { code: "+46", iso: "SE", name: "Sweden" },
  { code: "+41", iso: "CH", name: "Switzerland" },
  { code: "+963", iso: "SY", name: "Syria" },
  { code: "+886", iso: "TW", name: "Taiwan" },
  { code: "+992", iso: "TJ", name: "Tajikistan" },
  { code: "+255", iso: "TZ", name: "Tanzania" },
  { code: "+66", iso: "TH", name: "Thailand" },
  { code: "+228", iso: "TG", name: "Togo" },
  { code: "+690", iso: "TK", name: "Tokelau" },
  { code: "+676", iso: "TO", name: "Tonga" },
  { code: "+1-868", iso: "TT", name: "Trinidad and Tobago" },
  { code: "+216", iso: "TN", name: "Tunisia" },
  { code: "+90", iso: "TR", name: "Turkey" },
  { code: "+993", iso: "TM", name: "Turkmenistan" },
  { code: "+1-649", iso: "TC", name: "Turks and Caicos Islands" },
  { code: "+688", iso: "TV", name: "Tuvalu" },
  { code: "+1-340", iso: "VI", name: "U.S. Virgin Islands" },
  { code: "+256", iso: "UG", name: "Uganda" },
  { code: "+380", iso: "UA", name: "Ukraine" },
  { code: "+971", iso: "AE", name: "United Arab Emirates" },
  { code: "+44", iso: "GB", name: "United Kingdom" },
  { code: "+1", iso: "US", name: "United States" },
  { code: "+598", iso: "UY", name: "Uruguay" },
  { code: "+998", iso: "UZ", name: "Uzbekistan" },
  { code: "+678", iso: "VU", name: "Vanuatu" },
  { code: "+379", iso: "VA", name: "Vatican" },
  { code: "+58", iso: "VE", name: "Venezuela" },
  { code: "+84", iso: "VN", name: "Vietnam" },
  { code: "+681", iso: "WF", name: "Wallis and Futuna" },
  { code: "+212", iso: "EH", name: "Western Sahara" },
  { code: "+967", iso: "YE", name: "Yemen" },
  { code: "+260", iso: "ZM", name: "Zambia" },
  { code: "+263", iso: "ZW", name: "Zimbabwe" },
] as const;

function getFlag(iso: string) {
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

interface PhoneInputProps {
  name: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  defaultCountry?: string;
  defaultValue?: string;
  // Controlled mode
  value?: string;
  onChange?: (value: string) => void;
}

export function PhoneInput({
  name,
  id,
  required,
  autoComplete,
  className,
  defaultCountry = "IN",
  defaultValue,
  value: controlledValue,
  onChange: onControlledChange,
}: PhoneInputProps) {
  const isControlled = controlledValue !== undefined;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => {
    const initial = defaultValue ?? controlledValue;
    if (initial) {
      const match = COUNTRY_CODES.find((c) => initial.startsWith(c.code));
      if (match) return match;
    }
    return COUNTRY_CODES.find((c) => c.iso === defaultCountry) ?? COUNTRY_CODES[0];
  });
  const [internalPhone, setInternalPhone] = useState(() => {
    if (defaultValue && defaultValue.startsWith(selected.code)) {
      return defaultValue.slice(selected.code.length);
    }
    return "";
  });

  // In controlled mode derive the bare number from the external value
  const phone = isControlled
    ? controlledValue.startsWith(selected.code)
      ? controlledValue.slice(selected.code.length)
      : controlledValue
    : internalPhone;

  const setPhone = (val: string) => {
    if (isControlled) {
      onControlledChange?.(`${selected.code}${val}`);
    } else {
      setInternalPhone(val);
    }
  };

  const handleSelectCountry = (c: typeof selected) => {
    setSelected(c);
    setOpen(false);
    if (isControlled) {
      onControlledChange?.(`${c.code}${phone}`);
    }
  };
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      const t = setTimeout(() => searchRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search) ||
          c.iso.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRY_CODES;

  return (
    <div className={cn("flex gap-2", className)}>
      <input type="hidden" name={name} value={phone ? `${selected.code}${phone}` : ""} />

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <span className="text-base leading-none">{getFlag(selected.iso)}</span>
          <span className="text-muted-foreground">{selected.code}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner side="bottom" align="start" sideOffset={4} className="z-50">
            <PopoverPrimitive.Popup className="w-64 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
              {/* Search */}
              <div className="border-b p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Country list */}
              <div className="max-h-52 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="p-3 text-center text-sm text-muted-foreground">No results</p>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={c.iso}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                        selected.iso === c.iso && "bg-accent"
                      )}
                    >
                      <span className="text-base leading-none">{getFlag(c.iso)}</span>
                      <span className="flex-1 truncate text-left">{c.name}</span>
                      <span className="shrink-0 text-muted-foreground">{c.code}</span>
                    </button>
                  ))
                )}
              </div>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      <input
        id={id}
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder="Phone number"
        className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
