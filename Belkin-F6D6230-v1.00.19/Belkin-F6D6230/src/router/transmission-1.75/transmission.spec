%define name transmission
%define version 1.75
%define release 1

Summary:   Transmission BitTorrent Client
Name:      %{name}
Version:   %{version}
Release:   %{release}
License:   MIT
Group:     Applications/Internet
URL:       http://www.transmissionbt.com/
Epoch:     1
Source0:   %{name}-%{version}.tar.bz2

BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
BuildRequires: curl-devel >= 7.16.3
BuildRequires: openssl-devel >= 0.9.4
BuildRequires: glib2-devel >= 2.6.0
BuildRequires: gtk2-devel >= 2.6.0
BuildRequires: libnotify-devel >= 0.4.3
BuildRequires: libevent-devel >= @LIBEVENT_MINIMUM@
BuildRequires: dbus-glib-devel >= 0.70

Requires: curl >= 7.16.3
Requires: openssl >= 0.9.4
Requires: glib2 >= 2.6.0
Requires: gtk2 >= 2.6.0
Requires: libevent >= @LIBEVENT_MINIMUM@
Requires: libnotify >= 0.4.3
Requires: dbus-glib >= 0.70

Provides: %{name}

%description
A fast and easy BitTorrent client

%prep
%setup -q
%build
%configure --program-prefix="" 
make CFLAGS="$RPM_OPT_FLAGS"
%install
rm -rf $RPM_BUILD_ROOT
make DESTDIR=$RPM_BUILD_ROOT install
%find_lang %{name}
%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root)
%doc AUTHORS NEWS README
%attr(755,root,root) %{_bindir}/%{name}*
%{_datadir}/applications/%{name}.desktop
%{_datadir}/pixmaps/*
%{_datadir}/icons/*
%{_datadir}/%{name}/web/*
%{_datadir}/man/man1/%{name}*
%{_datadir}/locale/*

%changelog

* Thu Mar 5 2009 Gijs <info@bsnw.nl>
- fixed %files section
- added Source0
* Wed Jul 18 2006 Charles Kerr <charles@transmissionbt.com>
- first draft at a spec file, cribbed from Pan's spec file
