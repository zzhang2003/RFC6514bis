Please add to and/or sign up from the folloing work items, and mark the
status accordingly.

Legend for the marking:
  * "Done": in the repository copy
  * "-xx": published revision number

Proposed Work Items:

- MVPN Inter-AS Upstream PE Selection based on unicast routes (Jeffrey)
  • Traffic blackholes may happen with selective tunnels
  • Traffic duplications may happen with inclusive tunnels
  • Section 1.4 of draft-zzhang-bess-mvpn-evpn-cmcast-enhancements

- Non-segmented Inter-AS support with IPv6 infrastructure (Jeffrey, -00)

- Rename the label field to accomodae other demulplexers (Jeffrey, -01)

? Pull in https://datatracker.ietf.org/doc/draft-zzhang-bess-bgp-mvpn-source-active-route (Rishabh?)

? Inter-area segmentation (RFC7524)
  * remove area restriction/assumption (Jeffrey)
    * https://datatracker.ietf.org/meeting/112/materials/slides-112-bess-draft-zzhang-bess-mvpn-regional-segmentation-01
  * Restrict the number of Inter-Area P2MP Segmented Next-Hop Extended Community to 1

- One item that Mankamana wanted to add (Mankamana - please clarify)

? Signaling IPinIP/GRE encapsulaion type (Jeffrey/Mankaman)
  * related to https://datatracker.ietf.org/doc/draft-ietf-pim-multicast-over-srv6/

- Pull the following RFC content to RFC6514bis
  • RFC6515: IPv4/IPv6 Infrastructure Addresses in BGP-MVPN routes (Hooman?)
  • RFC6625: wildcard A-D routes (Hooman?)
  • RFC9081: MVPN-MSDP SA route interaction (Jeffrey)
  • RFC7441: mLDP FEC encoding (Hooman/Mankamana?)
  • RFC8534: Explicit Tracking in wildcard A-D routes (Rishabh?)
  ? RFC9573: mvpn-evpn aggregation label (Jeffrey)
  	- RFC9573 has a lot of text about the use case and motivation,
	  but the core procedure is simple and it may be good to pull that in.

? Add an informational section at the beginning of the document to
  summarize all relevant MVPN features and RFCs (Rishabh/Mankamana)
  * see slide #3 of https://datatracker.ietf.org/meeting/122/materials/slides-122-bess-draft-zzhang-bess-rfc6514bis-00-02

- Discussion Points
  - Should/could we remove the resolution of PNH in MVPN routes?
  
- Misc. items
  
- Please add more items you think we should work on
