/*
 * This file Copyright (C) 2008-2009 Charles Kerr <charles@transmissionbt.com>
 *
 * This file is licensed by the GPL version 2.  Works owned by the
 * Transmission project are granted a special exemption to clause 2(b)
 * so that the bulk of its code can remain under the MIT license.
 * This exemption does not extend to derived works not owned by
 * the Transmission project.
 *
 * $Id: msgwin.h 7658 2009-01-10 23:09:07Z charles $
 */

#ifndef TG_MSGWIN_H
#define TG_MSGWIN_H

struct TrCore;

GtkWidget * msgwin_new( struct TrCore * core );

#endif
