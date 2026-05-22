---
coding: utf-8
coding: us-ascii

# this first section is yaml, not markdown
# "#" denotes comments here
# to use kramdonw, go to https://xml2rfc.tools.ietf.org/experimental.html,
# click on kramdown as input.  You can also download code to go from
# kramdown to xml and/or text.
# to debug, use the kramdown to xml convertor and pore through the xml.
#
# https://github.com/cabo/kramdown-rfc/wiki/Syntax#the-yaml-header
# https://github.com/cabo/kramdown-rfc/wiki/Syntax2#structured-information


title: Many fine lunches and dinners
abbrev: mfld
docname: draft-mfld-00
updates: 8279
category: info

stand_alone: yes
pi: [toc, sortrefs, symrefs, comments]

ipr: trust200902
area: Routing
wg: MPLS Working Group
kw: MPLS, resilience, traffic engineering

author:
  -
    ins: K. Kompella
    name: Kireeti Kompella
    org: Juniper Networks
    street: 1133 Innovation Way
    city: Sunnyvale
    code: 94089
    country: USA
    phone: +1-408-745-2000
    email: kireeti.kompella@gmail.com

{::comment}
The following is the “official” way of adding normative/informational rfcs, but I prefer doing it inline using {{!xxx}} or {{?xxx}}, in which case you don’t need this section.  You may need it if you have non-rfc references using the REST example as a template.
{:/comment}

#normative:
#        - rfc2119
#        - rfc2616
#        - I-D.ietf-core-coap
#  RFC2119:
#  RFC2616:
#  I-D.ietf-core-coap:
# Note: can insert normative rfcs thus: {{!RFC2119}}
#	and normative drafts thus: {{!I-D.ietf-core-coap}}

#informative:
#  REST:
#    title: Architectural Styles and the Design of Network-based Software Architectures
#    author:
#      -
#        ins: R. Fielding
#        name: Roy Fielding
#        org: University of California, Irvine
#    date: 2000
# Note: can insert informational rfcs thus: {{?RFC2119}}
#	and informational drafts: {{?I-D.ietf-core-coap}}

--- abstract

insert abstract here

--- middle

# First level heading {#intro}
Note that there is an anchor for this section (can be referenced with {{intro}})
for this section.

Some text (must have a blank line between paras).

A reference to an RFC: {{!RFC2119}}.

## Second level heading

More text

Next para

### Third level heading

## Formating

As you've seen above, you can have sections and sub(sub)sections.

### Artwork

Artwork doesn't need any special indicator; however, be sure to indent
at least four spaces.

    *-----*
    | box |
    *-----*
{: #box-fig title="Beautiful Box"}

It is generally preferable not to use tabs, especially in artwork.

Multiple diagrams can just follow one another:

            0
            0 1 2 3 4 5 6 7
           +-+-+-+-+-+-+-+-+
           |  NUM  |M| SZX |
           +-+-+-+-+-+-+-+-+

            0                   1
            0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
           +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
           |          NUM          |M| SZX |
           +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

            0                   1                   2
            0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3
           +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
           |                   NUM                 |M| SZX |
           +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
{: #block title="Block option value"}

To demarcate artwork, one can place it between a pair of ~~~~~~~~~~~, as
follows:

~~~~~~~~~~~
 Fancy Artwork
   using symbols that may otherwise be interpreted by md, like

* not a bullet
  * not a subbullet

| not a table |
|---|
| since columns don't line up |
~~~~~~~~~~~

whereas the following are interpreted by md:

* bullet
  * subbullet

| table header |
|---|
| columns line up nicely |

{{box-fig}} is clearly nicer than {{block}}.

### Bold/Italic text

You have to be a _total_ **geek** to use _italic_ or **bold**.  Of course,
this shows up pretty much as is for plaintext; it shows up at italic/bold
for html or pdf outputs.

### Lists

Intro text followed by bulleted list

- first bullet
+ second bullet (note that *, + and - interchangeably indicate bullets)
* Very long, multi-para bullet, with this as the first para, running into
multiple lines, ...

  ... continued (this is a long line to show that it will be formated as a
para would be; 2 leading spaces for first line of para for clean formating)

- bullet item with sub-bullets
  - subbullet 1 (note: number of leading spaces should be 2*level, where
    top-level = 0)
    - subsubbullet 1
      - top-level bullets are displayed in plaintext with o; subbullets
with *; subsubs with +; subsubsubs with -
  - subbullet 2

### Tables

Here is a table (with an anchor for reference):

| Type | C/E      | Name   | Format | Length | Default       |
|------:+----------+--------+--------+--------+---------------|
|   19 | Critical | Block1 | uint   | 1-3 B  | 0 (see below) |
|   17 | Critical | Block2 | uint   | 1-3 B  | 0 (see below) |
{: #block-option-numbers title="Block Option Numbers"}

While each column in the rows of {{block-option-numbers}} have more or
less been filled out with spaces so they align, there's no need for that.
Each column (as indicated by |) will be auto-aligned.  The : between the
Type and C/E column in the row below the heading indicates right
justification; the default is left justification.

### Definition lists

Here's an example definition list.  This would be nicely formated in html
or pdf; not quite so nice in plaintext.  Let's say NUM and M are fields in
a message.  Here's how you could define them.

NUM:
: Block Number. The block number is a variable-size (4, 12, or 20 bit)
  unsigned integer (uint, see Appendix A of {{?I-D.ietf-core-coap}})
  indicating the block number being requested or provided. Block
  number 0 indicates the first block of a body.

M:
: More Flag (not last block). For descriptive usage, this flag, if
  unset, indicates that the payload in this message is the last block
  in the body; when set it indicates that there are one or more
  additional blocks available.  When a Block2 Option is used in a
  request to retrieve a specific block number ("control usage"), the M
  bit MUST be sent as zero and ignored on reception.  (In a Block1
  Option in a response, the M flag is used to indicate atomicity, see
  below.)

